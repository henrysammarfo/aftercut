/**
 * Live Minds server functions — real api.build.hellominds.ai calls.
 * Docs: https://build.hellominds.ai/docs/get-started/client-library
 */

import { createServerFn } from "@tanstack/react-start";
import type { BrandKit } from "../aftercut-data";
import { parseAtomizeReply, parseProactiveReply } from "./parse";
import { atomizePrompt, proactivePrompt, publishDeniedPrompt, soulSyncPrompt } from "./prompts";
import {
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
      isEnabled: boolean;
      cognition: number | null;
      email: string | null;
      minds: Array<{ mindId: string; name: string | null; hasTelegram: boolean }>;
    }
  | { ok: false; connected: false; error: string };

export const fetchMindStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveStatusResult> => {
    if (!getBuilderApiKey()) {
      return {
        ok: false,
        connected: false,
        error: "MINDS_BUILDER_API_KEY not set — add Builder key in aftercut/.env.local",
      };
    }
    try {
      const client = createLiveMindsClient();
      const minds = await client.listMinds();
      const director = await resolveDirectorMind(client);
      let cognition: number | null = null;
      try {
        const bal = await client.getCognitionBalance(director.mindId);
        cognition = bal.cognition;
      } catch {
        cognition = null;
      }
      const detail = await client.getMind(director.mindId);
      return {
        ok: true,
        connected: true,
        mindId: director.mindId,
        mindName: director.name ?? detail.name ?? "Director",
        hasTelegram: Boolean(detail.hasTelegram ?? director.hasTelegram),
        isEnabled: detail.isEnabled !== false,
        cognition,
        email: detail.email ?? null,
        minds: minds.map((m) => ({
          mindId: m.mindId,
          name: m.name ?? null,
          hasTelegram: Boolean(m.hasTelegram),
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
        mindName: string;
        mindId: string;
      }
    | { ok: false; error: string }
  > => {
    const data = payload<LiveAtomizeInput>(ctx);
    if (!data?.userId || !data.kit || !data.text?.trim()) {
      return { ok: false, error: "Missing atomize payload." };
    }
    if (data.kit.name.trim().length < 2 || data.kit.tone.trim().length < 3) {
      return { ok: false, error: "Brand kit incomplete before live atomize." };
    }

    const res = await talkToDirector({
      userId: data.userId,
      messageText: atomizePrompt({
        kit: data.kit,
        title: data.title,
        source: data.source,
        text: data.text,
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
        mindName: res.mindName,
        mindId: res.mindId,
      };
    } catch (e) {
      return {
        ok: false,
        error: `Mind replied but JSON parse failed: ${e instanceof Error ? e.message : String(e)}. Excerpt: ${res.replyText.slice(0, 160)}`,
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
    } catch (e) {
      return {
        ok: false,
        error: `Proactive parse failed: ${e instanceof Error ? e.message : String(e)}`,
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
