/**
 * Live trend context for atomize — Tavily when key present.
 * Keys: process.env / aftercut .env.local / scoutbot agent/.env (dev).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function readKey(name: string): string | null {
  const fromEnv = process.env[name]?.trim();
  if (fromEnv) return fromEnv;
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
  return null;
}

export type TrendsResult =
  | { ok: true; summary: string; sources: string[] }
  | { ok: false; error: string };

/** Short creator-platform trend brief for Mind atomize context. */
export async function fetchCreatorTrends(input: {
  brandName: string;
  primaryPlatform?: string;
  topicHint?: string;
}): Promise<TrendsResult> {
  const key = readKey("TAVILY_API_KEY");
  if (!key) return { ok: false, error: "TAVILY_API_KEY not set" };

  const platform = input.primaryPlatform?.trim() || "YouTube Shorts X LinkedIn";
  const topic = input.topicHint?.trim() || input.brandName || "creator content";
  const query = `${topic} ${platform} content trends hooks hashtags 2026`;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Tavily HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      answer?: string;
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };
    const lines: string[] = [];
    if (data.answer?.trim()) lines.push(data.answer.trim());
    const sources: string[] = [];
    for (const r of data.results ?? []) {
      if (r.title) lines.push(`- ${r.title}${r.content ? `: ${r.content.slice(0, 140)}` : ""}`);
      if (r.url) sources.push(r.url);
    }
    const summary = lines.join("\n").slice(0, 2200);
    if (!summary) return { ok: false, error: "Tavily empty" };
    return { ok: true, summary, sources: sources.slice(0, 5) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
