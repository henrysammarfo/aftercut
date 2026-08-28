/**
 * Live Minds (Animoca) — server-only runtime.
 * Docs: https://build.hellominds.ai/docs/get-started/client-library
 * Auth: MINDS_BUILDER_API_KEY → X-Api-Key · host: api.build.hellominds.ai
 */

import {
  BUILDER_API_KEY_ENV,
  createMindsClient,
  type BuilderMind,
  type MindsClient,
} from "@animocabrands/minds-client-lib";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { stripMindHtml } from "./parse";
import { withRetry } from "./retry";

const DIRECTOR_ENV = "MINDS_DIRECTOR_MIND_ID";
const ALIAS_PREFIX = "aftercut";

/** Load secret from process.env, then aftercut .env.local, then scoutbot agent/.env (dev only). Never commits. */
function readKeyFromDisk(name: string): string | undefined {
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "..", "scoutbot", "agent", ".env"),
    resolve("C:/Users/jessi/Desktop/scoutbot/agent/.env"),
  ];
  for (const file of candidates) {
    try {
      if (!existsSync(file)) continue;
      const text = readFileSync(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq < 1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        if (k === name && v) return v;
      }
    } catch {
      /* skip unreadable */
    }
  }
  return undefined;
}

export function getBuilderApiKey(): string | null {
  const fromEnv =
    process.env[BUILDER_API_KEY_ENV]?.trim() ||
    process.env.MINDS_ACCESS_KEY?.trim() ||
    "";
  if (fromEnv) return fromEnv;
  return (
    readKeyFromDisk(BUILDER_API_KEY_ENV) ||
    readKeyFromDisk("MINDS_ACCESS_KEY") ||
    null
  );
}

export function getConfiguredDirectorMindId(): string | null {
  return (
    process.env[DIRECTOR_ENV]?.trim() ||
    readKeyFromDisk(DIRECTOR_ENV) ||
    null
  );
}

export function createLiveMindsClient(): MindsClient {
  const key = getBuilderApiKey();
  if (!key) {
    throw new Error(
      `${BUILDER_API_KEY_ENV} missing. Create a Builder key at build.hellominds.ai and set it in .env.local`,
    );
  }
  return createMindsClient({ builderApiKey: key });
}

/**
 * Resolve Director Mind for a tenant — linked Mind ID required (no shared env fallback).
 */
export async function resolveDirectorMind(
  client: MindsClient,
  opts?: { mindId?: string | null },
): Promise<BuilderMind> {
  const minds = await client.listMinds();
  if (!minds.length) {
    throw new Error(
      "No Minds on this Builder account. Awaken a Mind on hellominds.ai, then paste its ID in Settings.",
    );
  }

  const preferred = opts?.mindId?.trim() || null;
  if (!preferred) {
    throw new Error(
      "Link your Mind in Settings first — paste your hellominds Mind UUID.",
    );
  }
  const hit = minds.find((m) => m.mindId === preferred);
  if (!hit) {
    throw new Error(
      `Linked Mind ${preferred} not found on this Builder key. Relink in Settings. Available: ${minds
        .map((m) => m.mindId)
        .join(", ")}`,
    );
  }
  return hit;
}

/** Minds API rejects aliases longer than 64 characters. */
const ALIAS_MAX = 64;

/** Main thread (soul / transcript / leash). Pass `channel` to isolate JSON-cut jobs. */
export function conversationAlias(userId: string, channel?: string): string {
  const clean = userId.replace(/[^a-zA-Z0-9_-]/g, "") || "user";
  if (!channel?.trim()) {
    // aftercut_ + user ≤ 64
    return `${ALIAS_PREFIX}_${clean}`.slice(0, ALIAS_MAX);
  }
  // Keep channel short so long Better Auth userIds still fit under 64.
  const ch = channel.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12);
  const prefix = `${ALIAS_PREFIX}_`;
  const suffix = `_${ch}`;
  const userBudget = Math.max(8, ALIAS_MAX - prefix.length - suffix.length);
  return `${prefix}${clean.slice(0, userBudget)}${suffix}`.slice(0, ALIAS_MAX);
}

export type MindTalkResult =
  | { ok: true; replyText: string; mindId: string; mindName: string; alias: string }
  | { ok: false; error: string };

/** Ensure conversation, send human message, wait for live Mind reply. */
export async function talkToDirector(input: {
  userId: string;
  messageText: string;
  timeoutMs?: number;
  /** Isolate atomize/Day-2 from the soul thread so JSON-template refusals don't poison memory. */
  channel?: string;
  /** Per-tenant Mind id from Settings. */
  mindId?: string | null;
}): Promise<MindTalkResult> {
  return withRetry(
    async () => {
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client, { mindId: input.mindId });
      const alias = conversationAlias(input.userId, input.channel);
      await client.ensureConversation(alias, director.mindId);

      const before = await client.getLatestHistoryFingerprint(alias);
      await client.sendMessage({
        alias,
        messageText: input.messageText,
      });

      const outcome = await client.waitForReply({
        alias,
        timeoutMs: input.timeoutMs ?? 180_000,
        afterFingerprint: before,
        sentMessageText: input.messageText,
      });

      if (outcome.timedOut) {
        return {
          ok: false,
          error: "Your agent took too long to respond. Check your credits and try again.",
        };
      }

      const replyText = (outcome.reply.messageText ?? "").trim();
      if (!replyText) {
        return { ok: false, error: "Your agent returned an empty response. Try again." };
      }

      return {
        ok: true,
        replyText: stripMindHtml(replyText) || replyText,
        mindId: director.mindId,
        mindName: director.name ?? "AFTERCUT Director",
        alias,
      };
    },
    { label: "talkToDirector", attempts: 2 },
  ).catch((e) => ({
    ok: false as const,
    error: e instanceof Error ? e.message : String(e),
  }));
}
