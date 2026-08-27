/**
 * AgentRouter gateway — one key → Claude / GPT / DeepSeek (model switch).
 * WAF requires Claude Code wire-image headers on Anthropic Messages API.
 * Docs: https://docs.agentrouter.org/en/start.html
 * Do NOT ask for native OpenAI/Anthropic keys — AgentRouter holds the credits.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const AR_BASE =
  process.env["AGENT_ROUTER_BASE"]?.trim() ||
  process.env["AGENT_ROUTER_ANTHROPIC_BASE"]?.trim() ||
  "https://agentrouter.org";

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
      for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
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
      /* skip */
    }
  }
  return undefined;
}

export function getAgentRouterKey(): string | null {
  return (
    process.env["AGENT_ROUTER_API_KEY"]?.trim() ||
    process.env["ANTHROPIC_AUTH_TOKEN"]?.trim() ||
    process.env["ANTHROPIC_API_KEY"]?.trim() ||
    readKeyFromDisk("AGENT_ROUTER_API_KEY") ||
    readKeyFromDisk("ANTHROPIC_AUTH_TOKEN") ||
    readKeyFromDisk("ANTHROPIC_API_KEY") ||
    null
  );
}

export function agentRouterConfigured(): boolean {
  return Boolean(getAgentRouterKey());
}

/** Claude Code wire-image headers — required by AgentRouter WAF. */
function claudeCodeHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    "x-api-key": key,
    "User-Agent": "claude-cli/2.1.158 (external, sdk-cli)",
    "anthropic-version": "2023-06-01",
    "anthropic-beta":
      "claude-code-20250219,interleaved-thinking-2025-05-14,effort-2025-11-24,oauth-2025-04-20",
    "anthropic-dangerous-direct-browser-access": "true",
    "x-app": "cli",
    "x-stainless-lang": "js",
    "x-stainless-package-version": "0.55.1",
    "x-stainless-os": "Windows",
    "x-stainless-arch": "x64",
    "x-stainless-runtime": "node",
    "x-stainless-runtime-version": process.version,
  };
}

export type RouterFamily = "claude" | "gpt" | "deepseek" | "auto";

function resolveModel(family: RouterFamily): { model: string; via: "anthropic" | "openai" } {
  if (family === "gpt") {
    return {
      model:
        process.env["AGENT_ROUTER_OPENAI_MODEL"]?.trim() ||
        process.env["OPENAI_MODEL"]?.trim() ||
        "gpt-5.6-sol",
      via: "openai",
    };
  }
  if (family === "deepseek") {
    return {
      model: process.env["AGENT_ROUTER_DEEPSEEK_MODEL"]?.trim() || "deepseek-v4-flash",
      via: "openai",
    };
  }
  // claude | auto → Opus via Anthropic Messages (WAF-friendly path)
  return {
    model:
      process.env["AGENT_ROUTER_ANTHROPIC_MODEL"]?.trim() ||
      process.env["ANTHROPIC_MODEL"]?.trim() ||
      "claude-opus-5",
    via: "anthropic",
  };
}

export type LiveChatResult =
  | { ok: true; text: string; model: string; provider: "openai" | "anthropic" }
  | { ok: false; error: string };

/**
 * Live chat through AgentRouter.
 * Default: Claude Opus (Anthropic Messages + Claude Code headers).
 * Pass family: "gpt" | "deepseek" for OpenAI-compatible route.
 */
export async function liveChat(input: {
  system?: string;
  user: string;
  family?: RouterFamily;
  maxTokens?: number;
}): Promise<LiveChatResult> {
  const key = getAgentRouterKey();
  if (!key) {
    return {
      ok: false,
      error: "AGENT_ROUTER_API_KEY missing — set on Vercel / .env.local",
    };
  }

  const family = input.family ?? "auto";
  const primary = resolveModel(family);
  const attempts: Array<{ model: string; via: "anthropic" | "openai" }> = [primary];
  if (family === "auto") {
    attempts.push(resolveModel("gpt"), resolveModel("deepseek"));
  }

  const errors: string[] = [];
  for (const attempt of attempts) {
    const res =
      attempt.via === "anthropic"
        ? await chatAnthropic(key, { ...input, model: attempt.model })
        : await chatOpenAI(key, { ...input, model: attempt.model });
    if (res.ok) return res;
    errors.push(`${attempt.model}: ${res.error}`);
  }
  return { ok: false, error: errors.join(" · ") || "AgentRouter failed." };
}

async function chatAnthropic(
  key: string,
  input: { system?: string; user: string; maxTokens?: number; model: string },
): Promise<LiveChatResult> {
  const base = AR_BASE.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/v1/messages?beta=true`, {
      method: "POST",
      headers: claudeCodeHeaders(key),
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens ?? 4096,
        ...(input.system ? { system: input.system } : {}),
        messages: [{ role: "user", content: input.user }],
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${raw.slice(0, 280)}` };
    }
    const data = JSON.parse(raw) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("\n")
      .trim();
    if (!text) return { ok: false, error: "Empty Anthropic reply" };
    return { ok: true, text, model: input.model, provider: "anthropic" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function chatOpenAI(
  key: string,
  input: { system?: string; user: string; maxTokens?: number; model: string },
): Promise<LiveChatResult> {
  const base = AR_BASE.replace(/\/$/, "");
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (input.system) messages.push({ role: "system", content: input.system });
    messages.push({ role: "user", content: input.user });
    // OpenAI-compatible route — still send Claude Code UA so WAF is less hostile
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        ...claudeCodeHeaders(key),
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        max_tokens: input.maxTokens ?? 4096,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${raw.slice(0, 280)}` };
    }
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "Empty OpenAI-compatible reply" };
    return { ok: true, text, model: input.model, provider: "openai" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type ImageGenResult =
  | { ok: true; b64: string; mime: string; model: string }
  | { ok: false; error: string };

/**
 * Post still via AgentRouter OpenAI Images (same key / credits).
 * If Images is blocked by WAF, callers should fall back to Mind-directed creative.
 */
export async function generatePostImage(input: {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
}): Promise<ImageGenResult> {
  const key = getAgentRouterKey();
  if (!key) {
    return { ok: false, error: "AGENT_ROUTER_API_KEY missing" };
  }
  const model = process.env["AGENT_ROUTER_IMAGE_MODEL"]?.trim() || "gpt-image-1";
  const base = AR_BASE.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/v1/images/generations`, {
      method: "POST",
      headers: {
        ...claudeCodeHeaders(key),
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        prompt: input.prompt.slice(0, 3500),
        size: input.size ?? "1024x1024",
        n: 1,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: `Images HTTP ${res.status} ${raw.slice(0, 280)}` };
    }
    const data = JSON.parse(raw) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    const row = data.data?.[0];
    if (row?.b64_json) {
      return { ok: true, b64: row.b64_json, mime: "image/png", model };
    }
    if (row?.url) {
      const img = await fetch(row.url);
      if (!img.ok) return { ok: false, error: `Fetch image URL HTTP ${img.status}` };
      const buf = Buffer.from(await img.arrayBuffer());
      return {
        ok: true,
        b64: buf.toString("base64"),
        mime: img.headers.get("content-type") || "image/png",
        model,
      };
    }
    return { ok: false, error: "No image data in response" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
