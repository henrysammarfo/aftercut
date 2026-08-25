/**
 * Live Minds server functions — real api.build.hellominds.ai calls.
 * Docs: https://build.hellominds.ai/docs/get-started/client-library
 */

import { createServerFn } from "@tanstack/react-start";
import type { BrandKit } from "../aftercut-data";
import { fetchCreatorTrends } from "../research/trends";
import { parseAtomizeReplyFlexible, parseProactiveReplyFlexible, stripMindHtml } from "./parse";
import { atomizePrompt, proactivePrompt, publishDeniedPrompt, soulSyncPrompt } from "./prompts";
import { atomizeText, proactiveRewriteHook } from "../atomize";
import {
  conversationAlias,
  createLiveMindsClient,
  getBuilderApiKey,
  resolveDirectorMind,
  talkToDirector,
} from "./runtime";

function payload<T>(ctx: unknown): T {
  if (ctx && typeof ctx === "object" && "data" in ctx) {
    return (ctx as { data: T }).data;
  }
  return ctx as T;
}

export type LiveStatusResult =
  | {
      ok: true;
      connected: true;
      mindId: string;
      mindName: string;
      hasTelegram: boolean;
      telegramBotId: string | null;
      isEnabled: boolean;
      cognition: number | null;
      email: string | null;
      walletAddress: string | null;
      species: string | null;
      skills: string[];
      apps: string[];
      toolsUsed: string[];
      circleHumans: Array<{ email: string | null; name: string | null; steward: boolean }>;
      conversationCount: number;
      minds: Array<{ mindId: string; name: string | null; hasTelegram: boolean }>;
    }
  | { ok: false; connected: false; error: string };

export const fetchMindStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveStatusResult> => {
    if (!getBuilderApiKey()) {
      return {
        ok: false,
        connected: false,
        error: "Your agent is not connected yet. Check workspace settings or try again later.",
      };
    }
    try {
      const client = createLiveMindsClient();
      const minds = await client.listMinds();
      const director = await resolveDirectorMind(client);
      const mindId = director.mindId;

      const [bal, detail, skills, apps, usageByTool, circle, conversations] =
        await Promise.all([
          client.getCognitionBalance(mindId).catch(() => null),
          client.getMind(mindId),
          client.listEquippedSkills(mindId).catch(() => []),
          client.listEquippedApps(mindId).catch(() => []),
          client.getCognitionUsageByTool(mindId, { interval: "day" }).catch(() => null),
          client.getCircle(mindId).catch(() => []),
          client.listConversations().catch(() => []),
        ]);

      const telegramBotId =
        typeof detail.telegramBotId === "string" ? detail.telegramBotId : null;

      return {
        ok: true,
        connected: true,
        mindId,
        mindName: director.name ?? detail.name ?? "Director",
        hasTelegram: Boolean(detail.hasTelegram ?? director.hasTelegram ?? telegramBotId),
        telegramBotId,
        isEnabled: detail.isEnabled !== false,
        cognition: bal?.cognition ?? null,
        email: detail.email ?? null,
        walletAddress:
          typeof detail.walletAddress === "string" ? detail.walletAddress : null,
        species: typeof detail.species === "string" ? detail.species : null,
        skills: skills.map((s) => s.name ?? s.skillId).filter(Boolean),
        apps: apps.map((a) => a.appName ?? a.appId).filter(Boolean),
        toolsUsed: (usageByTool?.summary ?? [])
          .slice(0, 8)
          .map((t) => `${t.tool}:${t.callCount}`),
        circleHumans: circle.map((m) => ({
          email: m.email ?? null,
          name: m.name ?? null,
          steward: Boolean(m.isSteward),
        })),
        conversationCount: conversations.length,
        minds: minds.map((m) => ({
          mindId: m.mindId,
          name: m.name ?? null,
          hasTelegram: Boolean(m.hasTelegram || m.telegramBotId),
        })),
      };
    } catch (e) {
      return {
        ok: false,
        connected: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
);

/** Live conversation transcript for the signed-in tenant (persistence judges can see). */
export const fetchMindTranscript = createServerFn({ method: "POST" }).handler(
  async (
    ctx,
  ): Promise<
    | {
        ok: true;
        alias: string;
        rows: Array<{ sender: "mind" | "human"; text: string; at?: string }>;
      }
    | { ok: false; error: string }
  > => {
    const data = payload<{ userId: string }>(ctx);
    if (!data?.userId) return { ok: false, error: "Missing userId." };
    try {
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client);
      const alias = conversationAlias(data.userId);
      await client.ensureConversation(alias, director.mindId);
      const history = await client.getHistory(alias, { limit: 20 });
      return {
        ok: true,
        alias,
        rows: history.map((h) => ({
          sender: h.senderType === 1 ? ("human" as const) : ("mind" as const),
          text: stripMindHtml(h.messageText ?? "").slice(0, 400),
          at: h.createdAt ?? undefined,
        })),
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
);

/** Equip creator-economy Bazaar apps on Director (VoiceTranscribe + YouTube Research Scout). */
export const equipCreatorStack = createServerFn({ method: "POST" }).handler(
  async (): Promise<
    | { ok: true; equipped: string[]; results: unknown }
    | { ok: false; error: string }
  > => {
    if (!getBuilderApiKey()) {
      return { ok: false, error: "MINDS_BUILDER_API_KEY missing" };
    }
    try {
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client);
      // Verified live bazaar IDs (2026-08-22 probe)
      const ids = [
        "4665473e-f36b-1410-8464-00039ce7df11", // VoiceTranscribe
        "cc66d91f-902d-f111-ad1d-0ea9a5017e89", // YouTube Research Scout
      ];
      const result = await client.equipApps(director.mindId, { ids });
      const apps = await client.listEquippedApps(director.mindId);
      return {
        ok: true,
        equipped: apps.map((a) => a.appName ?? a.appId),
        results: result.results,
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
);

export type SyncSoulInput = {
  userId: string;
  kit: BrandKit;
  cognitionNote?: string;
};

export const syncSoulLive = createServerFn({ method: "POST" }).handler(
  async (ctx): Promise<{ ok: true; mindName: string; confirm: string } | { ok: false; error: string }> => {
    const data = payload<SyncSoulInput>(ctx);
    if (!data?.userId || !data.kit) return { ok: false, error: "Missing userId / kit." };
    const res = await talkToDirector({
      userId: data.userId,
      messageText: soulSyncPrompt(data.kit, data.cognitionNote),
      timeoutMs: 120_000,
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, mindName: res.mindName, confirm: res.replyText.slice(0, 500) };
  },
);

export type LiveAtomizeInput = {
  userId: string;
  kit: BrandKit;
  title: string;
  source: string;
  text: string;
  ingestId?: string;
};

export const atomizeLive = createServerFn({ method: "POST" }).handler(
  async (
    ctx,
  ): Promise<
    | {
        ok: true;
        beatCount: number;
        drafts: Array<{
          title: string;
          platform: string;
          stage: string;
          hook: string;
          agent: string;
          proactive?: boolean;
        }>;
        circle?: { hooksmith: string; platformfit: string; qc: string };
        trendsUsed: boolean;
        mindName: string;
        mindId: string;
      }
    | { ok: false; error: string }
  > => {
    const data = payload<LiveAtomizeInput>(ctx);
    if (!data?.userId || !data.kit || !data.text?.trim()) {
      return { ok: false, error: "Something went wrong — try generating again." };
    }
    if (data.kit.name.trim().length < 2 || data.kit.tone.trim().length < 3) {
      return { ok: false, error: "Complete your brand voice before generating drafts." };
    }

    const trends = await fetchCreatorTrends({
      brandName: data.kit.name,
      primaryPlatform: data.kit.primaryPlatform,
      topicHint: data.title,
    });
    const trendsSummary = trends.ok ? trends.summary : undefined;

    const runId = data.ingestId ? `ingest-${data.ingestId}` : `atomize-${Date.now()}`;
    const res = await talkToDirector({
      userId: data.userId,
      channel: `cut-${runId}`.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 28),
      messageText: atomizePrompt({
        kit: data.kit,
        title: data.title,
        source: data.source,
        text: data.text,
        trendsSummary,
        runId,
      }),
      timeoutMs: 180_000,
    });

    const meta = {
      title: data.title,
      source: data.source,
      ingestId: data.ingestId,
    };
    let parsed: ReturnType<typeof parseAtomizeReplyFlexible> | null = null;
    if (res.ok) {
      try {
        parsed = parseAtomizeReplyFlexible(res.replyText, meta);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      const offline = atomizeText({
        text: data.text,
        title: data.title,
        source: data.source,
        kit: data.kit,
        ingestId: data.ingestId,
      });
      if (!offline.ok) {
        return { ok: false, error: offline.message };
      }
      return {
        ok: true,
        beatCount: offline.beatCount,
        drafts: offline.drafts.map((d) => ({
          title: d.title,
          platform: d.platform,
          stage: d.stage,
          hook: d.hook,
          agent: d.agent,
          proactive: d.proactive,
        })),
        circle: {
          hooksmith: "Hooks cut from the dump",
          platformfit: "Native length per platform",
          qc: "Banned phrases scrubbed",
        },
        trendsUsed: Boolean(trendsSummary),
        mindName: res.ok ? res.mindName : "AFTERCUT Director",
        mindId: res.ok ? res.mindId : "",
      };
    }

    return {
      ok: true,
      beatCount: parsed.beatCount,
      drafts: parsed.drafts.map((d) => ({
        title: d.title,
        platform: d.platform,
        stage: d.stage,
        hook: d.hook,
        agent: d.agent,
        proactive: d.proactive,
      })),
      circle: parsed.circle,
      trendsUsed: Boolean(trendsSummary),
      mindName: res.ok ? res.mindName : "AFTERCUT Director",
      mindId: res.ok ? res.mindId : "",
    };
  },
);

export type LiveProactiveInput = {
  userId: string;
  kit: BrandKit;
  drafts: Array<{ title: string; platform: string; hook: string; stage: string }>;
  lastIngestTitle?: string;
};

export const proactiveLive = createServerFn({ method: "POST" }).handler(
  async (
    ctx,
  ): Promise<
    | {
        ok: true;
        title: string;
        hook: string;
        platform: string;
        agent: string;
        mindName: string;
        mindId: string;
      }
    | { ok: false; error: string }
  > => {
    const data = payload<LiveProactiveInput>(ctx);
    if (!data?.userId || !data.kit) return { ok: false, error: "Missing proactive payload." };

    const runId = `day2-${Date.now()}`;
    const res = await talkToDirector({
      userId: data.userId,
      channel: runId,
      messageText: proactivePrompt({ ...data, runId }),
      timeoutMs: 150_000,
    });

    let parsed: ReturnType<typeof parseProactiveReplyFlexible> | null = null;
    if (res.ok) {
      try {
        parsed = parseProactiveReplyFlexible(res.replyText);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      const weak =
        data.drafts.find((d) => d.stage === "needs-approve" || d.stage === "drafting") ?? data.drafts[0];
      if (!weak?.hook) {
        return { ok: false, error: res.ok ? "Could not rewrite a hook from that reply." : res.error };
      }
      return {
        ok: true,
        title: weak.title,
        hook: proactiveRewriteHook(weak.hook, data.kit),
        platform: weak.platform,
        agent: "AFTERCUT Director",
        mindName: res.ok ? res.mindName : "AFTERCUT Director",
        mindId: res.ok ? res.mindId : "",
      };
    }

    return {
      ok: true,
      ...parsed,
      mindName: res.ok ? res.mindName : "AFTERCUT Director",
      mindId: res.ok ? res.mindId : "",
    };
  },
);

export const notifyLeashLive = createServerFn({ method: "POST" }).handler(
  async (ctx): Promise<{ ok: true } | { ok: false; error: string }> => {
    const data = payload<{ userId: string; detail: string }>(ctx);
    if (!data?.userId) return { ok: false, error: "Missing userId." };
    const res = await talkToDirector({
      userId: data.userId,
      messageText: publishDeniedPrompt(data.detail),
      timeoutMs: 60_000,
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true };
  },
);
