/**
 * One-shot creator pain research for AFTERCUT jam harden.
 * Uses scoutbot/aftercut env keys. Never prints secrets.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const out = {};
  for (const p of [
    resolve("C:/Users/jessi/Desktop/aftercut/.env.local"),
    resolve("C:/Users/jessi/Desktop/scoutbot/agent/.env"),
  ]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (k && v && !out[k]) out[k] = v;
    }
  }
  return out;
}

const env = loadEnv();
const tavily = env.TAVILY_API_KEY;
const tinyfish = env.TINYFISH_API_KEY;
const outDir = resolve("C:/Users/jessi/Desktop/aftercut/docs/memory/research-raw");
mkdirSync(outDir, { recursive: true });

console.log(JSON.stringify({
  tavily: Boolean(tavily),
  tinyfish: Boolean(tinyfish),
  openai: Boolean(env.OPENAI_API_KEY),
  anthropic: Boolean(env.ANTHROPIC_API_KEY),
}));

async function tavilySearch(query) {
  if (!tavily) return { query, error: "no TAVILY_API_KEY" };
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: tavily,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
    }),
  });
  const json = await res.json();
  return {
    query,
    http: res.status,
    answer: json.answer ?? null,
    results: (json.results || []).slice(0, 8).map((r) => ({
      title: r.title,
      url: r.url,
      content: (r.content || "").slice(0, 400),
    })),
  };
}

async function tinyfishRun(url, goal) {
  if (!tinyfish) return { url, goal, error: "no TINYFISH_API_KEY" };
  const res = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": tinyfish,
    },
    body: JSON.stringify({ url, goal }),
  });
  const raw = await res.text();
  let extract = "";
  for (const line of raw.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const ev = JSON.parse(payload);
      if (ev.type === "COMPLETE" || ev.status === "COMPLETED") {
        extract = typeof ev.result === "string" ? ev.result : JSON.stringify(ev.result);
      }
    } catch {}
  }
  return { url, goal, http: res.status, extract: (extract || raw).slice(0, 5000) };
}

const queries = [
  "content creator pain points repurposing long form YouTube to Shorts TikTok LinkedIn 2025 2026",
  "why creators hate Opus Clip Descript CapCut multi platform posting brand voice memory",
  "YouTube creator workflow overnight clipping approval gate brand kit logo consistency",
];

const tavilyOut = [];
for (const q of queries) {
  console.log("TAVILY", q.slice(0, 60));
  tavilyOut.push(await tavilySearch(q));
}

const pages = [
  {
    url: "https://www.animocabrands.com/announcement/the-sandbox-and-animoca-brands-launch-creative-minds-jam-1-hong-kong-usd10000-agentic-ai-competition",
    goal: "Extract Creative Minds Jam #1 deadline, tracks, must-haves for submission, prizes.",
  },
  {
    url: "https://dorahacks.io/hackathon/creativeminds/detail",
    goal: "Extract submission requirements, deadline, judging criteria for Creative Minds Jam.",
  },
];

const tinyOut = [];
for (const p of pages) {
  console.log("TINYFISH", p.url);
  tinyOut.push(await tinyfishRun(p.url, p.goal));
}

const dump = {
  at: new Date().toISOString(),
  tools: { tavily: Boolean(tavily), tinyfish: Boolean(tinyfish) },
  tavily: tavilyOut,
  tinyfish: tinyOut,
};
writeFileSync(resolve(outDir, "creator-pain-2026-08-27.json"), JSON.stringify(dump, null, 2));
console.log("WROTE creator-pain-2026-08-27.json");
