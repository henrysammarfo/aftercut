/**
 * GOAI idea-search pass. Loads keys from scoutbot/agent/.env. Never prints secrets.
 */
import fs from "node:fs";
import path from "node:path";

const envPath = "C:\\Users\\jessi\\Desktop\\scoutbot\\agent\\.env";
const outDir = "C:\\Users\\jessi\\Desktop\\aftercut\\docs\\memory\\research-raw";

function loadEnv(p) {
  const raw = fs.readFileSync(p, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[t.slice(0, i).trim()] = v;
  }
  return env;
}

const env = loadEnv(envPath);
const tavily = env.TAVILY_API_KEY;
const tinyfish = env.TINYFISH_API_KEY;
if (!tavily) {
  console.error("MISSING TAVILY_API_KEY");
  process.exit(1);
}
console.log("tavily_key", tavily ? `len=${tavily.length}` : "no");
console.log("tinyfish_key", tinyfish ? `len=${tinyfish.length}` : "no");

async function tavilySearch(query, extra = {}) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: tavily,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
      include_raw_content: false,
      ...extra,
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { parseError: true, http: res.status, body: text.slice(0, 800) };
  }
  return {
    query,
    http: res.status,
    answer: json.answer || null,
    results: (json.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      score: r.score,
      content: (r.content || "").slice(0, 600),
    })),
    error: json.error || (!res.ok ? `http ${res.status}` : null),
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
  if (!res.ok) {
    return { url, goal, http: res.status, error: raw.slice(0, 400) };
  }
  let extract = "";
  const events = [];
  for (const line of raw.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const ev = JSON.parse(payload);
      events.push(ev.type || ev.status || "event");
      if (ev.type === "COMPLETE" || ev.status === "COMPLETED") {
        extract = typeof ev.result === "string" ? ev.result : JSON.stringify(ev.result);
      }
    } catch {
      /* ignore */
    }
  }
  return {
    url,
    goal,
    http: res.status,
    events: events.slice(0, 20),
    extract: (extract || raw).slice(0, 8000),
  };
}

const queries = [
  "GOAI Hangzhou Global Open-source AI Challenge 2026 Agent Infra AgentTeams Hiclaw deadline",
  "AgentTeams formerly Hiclaw agentscope-ai multi-agent Skill MCP required",
  "open source multi-agent infrastructure 2026 CrewAI AutoGen LangGraph AgentScope vs production SRE",
  "Alibaba Cloud Skills MCP Nacos Higress AgentLoop hackathon Agent Infra crowded",
  "production AI agent observability OpenTelemetry GenAI traces approval rollback audit",
  "multi-agent blast radius isolation human approval high-risk tool calls 2026",
  "agent skill versioning marketplace reusable skills agent teams",
];

const pages = [
  {
    url: "https://www.goaihz.com/",
    goal: "Extract official GOAI 2026 tracks, Agent Infra requirements, deadlines, prizes, AgentTeams/Hiclaw mentions, submission dates. Quote exact dates and rules. List any unique constraints.",
  },
  {
    url: "https://github.com/agentscope-ai/agentteams",
    goal: "Summarize AgentTeams (HiClaw) architecture: Manager Leader Workers Skills MCP Matrix. What is required vs optional. Any demo scenarios they already ship that hackathon teams will copy.",
  },
  {
    url: "https://hiclaw.io/",
    goal: "Extract product positioning, core features, example use cases. Note what a typical hackathon demo would clone.",
  },
];

const tavilyOut = [];
for (const q of queries) {
  console.log("TAVILY", q.slice(0, 70));
  try {
    tavilyOut.push(await tavilySearch(q));
  } catch (e) {
    tavilyOut.push({ query: q, error: String(e) });
  }
}

const tinyOut = [];
for (const p of pages) {
  console.log("TINYFISH", p.url);
  try {
    tinyOut.push(await tinyfishRun(p.url, p.goal));
  } catch (e) {
    tinyOut.push({ ...p, error: String(e) });
  }
}

const stamp = new Date().toISOString();
const payload = {
  stamp,
  tools: { tavily: true, tinyfish: Boolean(tinyfish) },
  tavily: tavilyOut,
  tinyfish: tinyOut,
};
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "goai-idea-search.json");
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log("WROTE", outPath);
console.log(
  "SUMMARY",
  JSON.stringify({
    tavilyOk: tavilyOut.filter((x) => x.http === 200).length,
    tavilyFail: tavilyOut.filter((x) => x.http !== 200).length,
    tinyOk: tinyOut.filter((x) => x.http === 200 && !x.error).length,
    tinyFail: tinyOut.filter((x) => x.error || x.http !== 200).length,
  }),
);
