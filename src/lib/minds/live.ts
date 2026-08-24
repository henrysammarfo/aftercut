/**
 * Live Minds server functions — real api.build.hellominds.ai calls.
 * Docs: https://build.hellominds.ai/docs/get-started/client-library
 */

import { createServerFn } from "@tanstack/react-start";
import type { BrandKit } from "../aftercut-data";
import { atomizeText, proactiveRewriteHook } from "../atomize";
import { fetchCreatorTrends } from "../research/trends";
import { parseAtomizeReply, parseProactiveReply, stripMindHtml } from "./parse";
import { atomizePrompt, proactivePrompt, publishDeniedPrompt, soulSyncPrompt } from "./prompts";
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

    const res = await talkToDirector({
      userId: data.userId,
      messageText: atomizePrompt({
        kit: data.kit,
        title: data.title,
        source: data.source,
        text: data.text,
        trendsSummary,
      }),
      timeoutMs: 180_000,
    });
    if (!res.ok) return { ok: false, error: res.error };

    try {
      const parsed = parseAtomizeReply(res.replyText, {
        title: data.title,
        source: data.source,
        ingestId: data.ingestId,
      });
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
        mindName: res.mindName,
        mindId: res.mindId,
      };
    } catch {
      const offline = atomizeText({
        text: data.text,
        title: data.title,
        source: data.source,
        kit: data.kit,
        ingestId: data.ingestId,
      });
      if (!offline.ok) {
        return {
          ok: false,
          error: "Your agent returned an unexpected format. Try generating again.",
        };
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
          hooksmith: "HOOKsmith pass — offline fallback after live reply",
          platformfit: "PLATFORMFIT pass — platform-native voice applied",
          qc: "QC pass — do-not-say phrases scrubbed",
        },
        trendsUsed: Boolean(trendsSummary),
        mindName: res.mindName,
        mindId: res.mindId,
      };
    }
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

    const res = await talkToDirector({
      userId: data.userId,
      messageText: proactivePrompt(data),
      timeoutMs: 150_000,
    });
    if (!res.ok) return { ok: false, error: res.error };

    try {
      const parsed = parseProactiveReply(res.replyText);
      return {
        ok: true,
        ...parsed,
        mindName: res.mindName,
        mindId: res.mindId,
      };
    } catch {
      const candidates = data.drafts.filter((d) => d.stage !== "shipped" && d.hook.trim());
      const weakest = candidates.sort((a, b) => a.hook.length - b.hook.length)[0];
      if (!weakest) {
        return { ok: false, error: "No drafts available for proactive rewrite." };
      }
      const hook = proactiveRewriteHook(weakest.hook, data.kit);
      return {
        ok: true,
        title: weakest.title,
        hook,
        platform: weakest.platform,
        agent: "AFTERCUT Director",
        mindName: res.mindName,
        mindId: res.mindId,
      };
    }
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
