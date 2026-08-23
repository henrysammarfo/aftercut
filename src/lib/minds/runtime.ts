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

export async function resolveDirectorMind(
  client: MindsClient,
): Promise<BuilderMind> {
  const forced = getConfiguredDirectorMindId();
  const minds = await client.listMinds();
  if (!minds.length) {
    throw new Error(
      "No Minds on this Builder account. Awaken AFTERCUT Director on hellominds.ai first.",
    );
  }
  if (forced) {
    const hit = minds.find((m) => m.mindId === forced);
    if (!hit) {
      throw new Error(
        `${DIRECTOR_ENV}=${forced} not found on account. Available: ${minds
          .map((m) => m.mindId)
          .join(", ")}`,
      );
    }
    return hit;
  }
  // Prefer name match AFTERCUT / Director, else first enabled, else first
  const byName =
    minds.find((m) => /aftercut|director/i.test(m.name ?? "")) ??
    minds.find((m) => m.isEnabled !== false) ??
    minds[0]!;
  return byName;
}

export function conversationAlias(userId: string, channel = "main"): string {
  const clean = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "user";
  const ch = channel.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "main";
  return `${ALIAS_PREFIX}_${clean}_${ch}`;
}

export type MindTalkResult =
  | { ok: true; replyText: string; mindId: string; mindName: string; alias: string }
  | { ok: false; error: string };

/** Ensure conversation, send human message, wait for live Mind reply. */
export async function talkToDirector(input: {
  userId: string;
  messageText: string;
  timeoutMs?: number;
  /** Isolate JSON tasks from Soul chat so the Director does not meta-reply. */
  channel?: string;
}): Promise<MindTalkResult> {
  return withRetry(
    async () => {
      const client = createLiveMindsClient();
      const director = await resolveDirectorMind(client);
      const alias = conversationAlias(input.userId, input.channel ?? "main");
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
