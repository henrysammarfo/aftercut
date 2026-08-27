/**
 * Live LLM — native OpenAI / Anthropic first; AgentRouter optional gateway.
 * AgentRouter coding keys often return 401 unauthorized_client for server apps.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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
    readKeyFromDisk("AGENT_ROUTER_API_KEY") ||
    readKeyFromDisk("ANTHROPIC_AUTH_TOKEN") ||
    null
  );
}

export function getOpenAIKey(): string | null {
  return (
    process.env["OPENAI_API_KEY"]?.trim() ||
    readKeyFromDisk("OPENAI_API_KEY") ||
    getAgentRouterKey()
  );
}

export function getAnthropicKey(): string | null {
  return (
    process.env["ANTHROPIC_API_KEY"]?.trim() ||
    process.env["ANTHROPIC_AUTH_TOKEN"]?.trim() ||
    readKeyFromDisk("ANTHROPIC_API_KEY") ||
    getAgentRouterKey()
  );
}

export function agentRouterConfigured(): boolean {
  return Boolean(getOpenAIKey() || getAnthropicKey());
}

function openaiBaseForKey(key: string): string {
  if (process.env["AGENT_ROUTER_OPENAI_BASE"]?.trim()) {
    return process.env["AGENT_ROUTER_OPENAI_BASE"].trim();
  }
  if (process.env["OPENAI_BASE_URL"]?.trim()) return process.env["OPENAI_BASE_URL"].trim();
  if (key === getAgentRouterKey()) return "https://agentrouter.org/v1";
  return "https://api.openai.com/v1";
}

function anthropicBaseForKey(key: string): string {
  if (process.env["AGENT_ROUTER_ANTHROPIC_BASE"]?.trim()) {
    return process.env["AGENT_ROUTER_ANTHROPIC_BASE"].trim();
  }
  if (process.env["ANTHROPIC_BASE_URL"]?.trim()) {
    return process.env["ANTHROPIC_BASE_URL"].trim();
  }
  if (key === getAgentRouterKey()) return "https://agentrouter.org";
  return "https://api.anthropic.com";
}

export type LiveChatResult =
  | { ok: true; text: string; model: string; provider: "openai" | "anthropic" }
  | { ok: false; error: string };

/** Prefer Claude Opus via Anthropic Messages; fall back to GPT chat completions. */
export async function liveChat(input: {
  system?: string;
  user: string;
  prefer?: "anthropic" | "openai" | "auto";
  maxTokens?: number;
}): Promise<LiveChatResult> {
  const prefer = input.prefer ?? "auto";
  const order: Array<"anthropic" | "openai"> =
    prefer === "openai"
      ? ["openai", "anthropic"]
      : prefer === "anthropic"
        ? ["anthropic", "openai"]
        : ["anthropic", "openai"];

  const errors: string[] = [];
  for (const provider of order) {
    const key = provider === "anthropic" ? getAnthropicKey() : getOpenAIKey();
    if (!key) {
      errors.push(`${provider}: key missing`);
      continue;
    }
    const res =
      provider === "anthropic"
        ? await chatAnthropic(key, input)
        : await chatOpenAI(key, input);
    if (res.ok) return res;
    errors.push(`${provider}: ${res.error}`);
  }
  return {
    ok: false,
    error:
      errors.join(" · ") ||
      "No live LLM keys. Set OPENAI_API_KEY and/or ANTHROPIC_API_KEY (native).",
  };
}

async function chatAnthropic(
  key: string,
  input: { system?: string; user: string; maxTokens?: number },
): Promise<LiveChatResult> {
  const model =
    process.env["AGENT_ROUTER_ANTHROPIC_MODEL"]?.trim() ||
    process.env["ANTHROPIC_MODEL"]?.trim() ||
    "claude-opus-4-5-20251101";
  const base = anthropicBaseForKey(key);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        Authorization: `Bearer ${key}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: input.maxTokens ?? 4096,
        ...(input.system ? { system: input.system } : {}),
        messages: [{ role: "user", content: input.user }],
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${raw.slice(0, 240)}` };
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
    return { ok: true, text, model, provider: "anthropic" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function chatOpenAI(
  key: string,
  input: { system?: string; user: string; maxTokens?: number },
): Promise<LiveChatResult> {
  const model =
    process.env["AGENT_ROUTER_OPENAI_MODEL"]?.trim() ||
    process.env["OPENAI_MODEL"]?.trim() ||
    "gpt-4.1";
  const base = openaiBaseForKey(key);
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (input.system) messages.push({ role: "system", content: input.system });
    messages.push({ role: "user", content: input.user });
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: input.maxTokens ?? 4096,
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${raw.slice(0, 240)}` };
    }
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "Empty OpenAI reply" };
    return { ok: true, text, model, provider: "openai" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type ImageGenResult =
  | { ok: true; b64: string; mime: string; model: string }
  | { ok: false; error: string };

/** Generate a square post still via OpenAI Images. */
export async function generatePostImage(input: {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
}): Promise<ImageGenResult> {
  const key = getOpenAIKey();
  if (!key) {
    return {
      ok: false,
      error: "OPENAI_API_KEY missing (native OpenAI key required for images)",
    };
  }
  const model = process.env["AGENT_ROUTER_IMAGE_MODEL"]?.trim() || "gpt-image-1";
  const base = openaiBaseForKey(key);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
