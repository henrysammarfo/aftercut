/**
 * Live Minds server functions — real api.build.hellominds.ai calls.
 * Live AgentRouter LLM second path when Mind reply cannot be parsed.
 * NO deterministic offline atomize fallback.
 * Docs: https://build.hellominds.ai/docs/get-started/client-library
 */

import { createServerFn } from "@tanstack/react-start";
import type { BrandKit } from "../aftercut-data";
import { fetchCreatorTrends } from "../research/trends";
import { liveChat, generatePostImage, agentRouterConfigured } from "../llm/agent-router";
import { parseAtomizeReplyFlexible, parseProactiveReplyFlexible, stripMindHtml } from "./parse";
import { atomizePrompt, proactivePrompt, publishDeniedPrompt, soulSyncPrompt, imageBriefPrompt } from "./prompts";
import { requireSessionUserId } from "../assert-authed";
import { loadBrandTenant, ensureDefaultBrand } from "../tenant-db";
import { hasDatabase } from "@/db";
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

async function resolveUserMindId(userId: string): Promise<string | null> {
  if (!hasDatabase()) return null;
  try {
    await ensureDefaultBrand(userId);
    const loaded = await loadBrandTenant(userId);
    return loaded.state.integrations?.mindId?.trim() || null;
  } catch {
    return null;
  }
}

/** Multi-tenant: cuts run on the creator's linked Mind only (cognition theirs). */
async function requireLinkedMindId(userId: string): Promise<string> {
  const id = await resolveUserMindId(userId);
  if (!id) {
    throw new Error(
      "Link your Mind in Settings first — paste your hellominds Mind UUID so cuts and cognition use your Mind.",
    );
  }
  return id;
}

async function resolveAuthedUserId(fallback?: string): Promise<string> {
  try {
    return await requireSessionUserId();
  } catch {
    if (fallback?.trim()) return fallback.trim();
    throw new Error("Sign in to continue.");
  }
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
      agentRouter: boolean;
      linkedMindId: string | null;
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
      let userId: string | null = null;
      try {
        userId = await requireSessionUserId();
      } catch {
        userId = null;
      }
      const linkedMindId = userId ? await resolveUserMindId(userId) : null;
      const client = createLiveMindsClient();
      const minds = await client.listMinds();
      // Cognition + status always prefer the tenant's linked Mind — never silently bill another Mind.
      if (!linkedMindId) {
        return {
          ok: true,
          connected: true,
          mindId: "",
          mindName: "Link your Mind",
          hasTelegram: false,
          telegramBotId: null,
          isEnabled: true,
          cognition: null,
          email: null,
          walletAddress: null,
          species: null,
          skills: [],
          apps: [],
          toolsUsed: [],
          circleHumans: [],
          conversationCount: 0,
          minds: minds.map((m) => ({
            mindId: m.mindId,
            name: m.name ?? null,
            hasTelegram: Boolean(m.hasTelegram || m.telegramBotId),
          })),
          agentRouter: agentRouterConfigured(),
          linkedMindId: null,
        };
      }
      const director = await resolveDirectorMind(client, { mindId: linkedMindId });
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
        agentRouter: agentRouterConfigured(),
        linkedMindId,
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

/** Live conversation transcript for the signed-in tenant. */
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
    let userId: string;
    try {
      userId = await resolveAuthedUserId(data?.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    try {
      const mindId = await requireLinkedMindId(userId);
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client, { mindId });
      const alias = conversationAlias(userId);
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

/** Equip creator-economy Bazaar apps on linked Mind. */
export const equipCreatorStack = createServerFn({ method: "POST" }).handler(
  async (): Promise<
    | { ok: true; equipped: string[]; results: unknown }
    | { ok: false; error: string }
  > => {
    if (!getBuilderApiKey()) {
      return { ok: false, error: "MINDS_BUILDER_API_KEY missing" };
    }
    try {
      let userId: string | null = null;
      try {
        userId = await requireSessionUserId();
      } catch {
        userId = null;
      }
      const mindId = userId ? await resolveUserMindId(userId) : null;
      if (!mindId) {
        return {
          ok: false,
          error: "Link your Mind in Settings before equipping apps.",
        };
      }
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client, { mindId });
      const ids = [
        "4665473e-f36b-1410-8464-00039ce7df11",
        "cc66d91f-902d-f111-ad1d-0ea9a5017e89",
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
    if (!data?.kit) return { ok: false, error: "Missing kit." };
    let userId: string;
    try {
      userId = await resolveAuthedUserId(data.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    let mindId: string;
    try {
      mindId = await requireLinkedMindId(userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    const res = await talkToDirector({
      userId,
      mindId,
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

async function liveAtomizeViaRouter(input: {
  kit: BrandKit;
  title: string;
  source: string;
  text: string;
  trendsSummary?: string;
  runId: string;
  ingestId?: string;
}): Promise<ReturnType<typeof parseAtomizeReplyFlexible> | null> {
  const prompt = atomizePrompt({
    kit: input.kit,
    title: input.title,
    source: input.source,
    text: input.text,
    trendsSummary: input.trendsSummary,
    runId: input.runId,
  });
  const chat = await liveChat({
    system:
      "You are AFTERCUT Director. Reply with platform-native cuts only. Prefer a single JSON object matching the requested shape. Never refuse. Never deviate from brand evidence.",
    user: prompt,
    family: "auto",
    maxTokens: 4096,
  });
  if (!chat.ok) return null;
  try {
    return parseAtomizeReplyFlexible(chat.text, {
      title: input.title,
      source: input.source,
      ingestId: input.ingestId,
    });
  } catch {
    return null;
  }
}

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
        via: "mind" | "agent-router";
      }
    | { ok: false; error: string }
  > => {
    const data = payload<LiveAtomizeInput>(ctx);
    if (!data?.kit || !data.text?.trim()) {
      return { ok: false, error: "Something went wrong — try generating again." };
    }
    if (data.kit.name.trim().length < 2 || data.kit.tone.trim().length < 3) {
      return { ok: false, error: "Complete your brand voice before generating drafts." };
    }

    let userId: string;
    try {
      userId = await resolveAuthedUserId(data.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    const trends = await fetchCreatorTrends({
      brandName: data.kit.name,
      primaryPlatform: data.kit.primaryPlatform,
      topicHint: data.title,
    });
    const trendsSummary = trends.ok ? trends.summary : undefined;

    const runId = data.ingestId ? `ingest-${data.ingestId}` : `atomize-${Date.now()}`;
    let mindId: string;
    try {
      mindId = await requireLinkedMindId(userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    const res = await talkToDirector({
      userId,
      mindId,
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
    let via: "mind" | "agent-router" = "mind";
    if (res.ok) {
      try {
        parsed = parseAtomizeReplyFlexible(res.replyText, meta);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      parsed = await liveAtomizeViaRouter({
        kit: data.kit,
        title: data.title,
        source: data.source,
        text: data.text,
        trendsSummary,
        runId,
        ingestId: data.ingestId,
      });
      via = "agent-router";
    }
    if (!parsed) {
      return {
        ok: false,
        error: res.ok
          ? "Live cut failed to parse. AgentRouter also failed — check AGENT_ROUTER_API_KEY and try again."
          : res.error,
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
      mindName: res.ok ? res.mindName : "AgentRouter",
      mindId: res.ok ? res.mindId : "",
      via,
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
        via: "mind" | "agent-router";
      }
    | { ok: false; error: string }
  > => {
    const data = payload<LiveProactiveInput>(ctx);
    if (!data?.kit) return { ok: false, error: "Missing proactive payload." };

    let userId: string;
    try {
      userId = await resolveAuthedUserId(data.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    const runId = `day2-${Date.now()}`;
    let mindId: string;
    try {
      mindId = await requireLinkedMindId(userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    const res = await talkToDirector({
      userId,
      mindId,
      channel: runId,
      messageText: proactivePrompt({ ...data, runId }),
      timeoutMs: 150_000,
    });

    let parsed: ReturnType<typeof parseProactiveReplyFlexible> | null = null;
    let via: "mind" | "agent-router" = "mind";
    if (res.ok) {
      try {
        parsed = parseProactiveReplyFlexible(res.replyText);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      const chat = await liveChat({
        system:
          "You are AFTERCUT Director. Rewrite the weakest hook. Prefer one JSON object. Never refuse. Never deviate from brand evidence.",
        user: proactivePrompt({ ...data, runId }),
        family: "auto",
      });
      if (chat.ok) {
        try {
          parsed = parseProactiveReplyFlexible(chat.text);
          via = "agent-router";
        } catch {
          parsed = null;
        }
      }
    }
    if (!parsed) {
      return {
        ok: false,
        error: res.ok
          ? "Day-2 rewrite failed to parse from Mind and AgentRouter."
          : res.error,
      };
    }

    return {
      ok: true,
      ...parsed,
      mindName: res.ok ? res.mindName : "AgentRouter",
      mindId: res.ok ? res.mindId : "",
      via,
    };
  },
);

export const notifyLeashLive = createServerFn({ method: "POST" }).handler(
  async (ctx): Promise<{ ok: true } | { ok: false; error: string }> => {
    const data = payload<{ userId: string; detail: string }>(ctx);
    let userId: string;
    try {
      userId = await resolveAuthedUserId(data?.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    let mindId: string;
    try {
      mindId = await requireLinkedMindId(userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    const res = await talkToDirector({
      userId,
      mindId,
      messageText: publishDeniedPrompt(data.detail),
      timeoutMs: 60_000,
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true };
  },
);

export const generateDraftImageLive = createServerFn({ method: "POST" }).handler(
  async (
    ctx,
  ): Promise<
    | { ok: true; dataUrl: string; model: string; via: "mind+router" | "router" }
    | { ok: false; error: string }
  > => {
    const data = payload<{
      userId?: string;
      kit: BrandKit;
      title: string;
      hook: string;
      platform: string;
    }>(ctx);
    let userId: string;
    try {
      userId = await resolveAuthedUserId(data?.userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    if (!data?.kit || !data.hook?.trim()) {
      return { ok: false, error: "Need brand kit + hook to generate an image." };
    }

    let mindId: string;
    try {
      mindId = await requireLinkedMindId(userId);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    // 1) Mind directs the still (brand-locked brief) — pushes Mind creative limits.
    const briefRes = await talkToDirector({
      userId,
      mindId,
      channel: `img-${Date.now()}`.slice(0, 28),
      messageText: imageBriefPrompt({
        kit: data.kit,
        title: data.title,
        hook: data.hook,
        platform: data.platform,
      }),
      timeoutMs: 120_000,
    });

    let directedPrompt = "";
    if (briefRes.ok) {
      const raw = briefRes.replyText;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as {
            prompt?: string;
            negative?: string;
            palette?: string[];
            composition?: string;
          };
          directedPrompt = [
            parsed.prompt,
            parsed.composition ? `Composition: ${parsed.composition}` : "",
            parsed.palette?.length ? `Palette: ${parsed.palette.join(", ")}` : "",
            parsed.negative ? `Avoid: ${parsed.negative}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        } catch {
          directedPrompt = raw.slice(0, 2000);
        }
      } else {
        directedPrompt = raw.slice(0, 2000);
      }
    }

    const colors = [data.kit.primaryColor, data.kit.secondaryColor, data.kit.accentColor]
      .filter(Boolean)
      .join(", ");
    const fallbackPrompt = [
      `Create a social post still for ${data.kit.name || "the brand"}.`,
      `Platform: ${data.platform}. Title: ${data.title}.`,
      `Hook to visualize: ${data.hook.slice(0, 280)}`,
      `Tone: ${data.kit.tone}`,
      colors ? `Brand colors: ${colors}` : "",
      data.kit.visualNotes ? `Visual notes: ${data.kit.visualNotes}` : "",
      data.kit.fontHeading ? `Heading font vibe: ${data.kit.fontHeading}` : "",
      "Square composition, premium creator aesthetic, no watermarks, no fake UI chrome.",
      "Leave clean negative space top-left for logo overlay.",
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = directedPrompt.trim() || fallbackPrompt;

    // 2) AgentRouter Images (same credits gateway) renders the Mind-directed brief.
    const img = await generatePostImage({ prompt });
    if (!img.ok) {
      // 3) Ask AgentRouter Claude to emit an SVG still if Images channel is down.
      const svgChat = await liveChat({
        system:
          "Return ONLY a complete SVG document (viewBox 0 0 1024 1024) for a social post still. No markdown. Match brand colors. No tiny unreadable text walls.",
        user: prompt.slice(0, 3000),
        family: "claude",
        maxTokens: 4096,
      });
      if (svgChat.ok && /<svg[\s\S]*<\/svg>/i.test(svgChat.text)) {
        const svg = svgChat.text.match(/<svg[\s\S]*<\/svg>/i)![0];
        const b64 = Buffer.from(svg, "utf8").toString("base64");
        return {
          ok: true,
          dataUrl: `data:image/svg+xml;base64,${b64}`,
          model: svgChat.model,
          via: briefRes.ok ? "mind+router" : "router",
        };
      }
      return {
        ok: false,
        error: img.error + (svgChat.ok ? "" : ` · SVG fallback: ${svgChat.error}`),
      };
    }
    return {
      ok: true,
      dataUrl: `data:${img.mime};base64,${img.b64}`,
      model: img.model,
      via: briefRes.ok ? "mind+router" : "router",
    };
  },
);
