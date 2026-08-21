/**
 * Tavily-only GOAI pass. Loads TAVILY_API_KEY from scoutbot/agent/.env.
 * Never prints the key.
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
const tavily = process.env.TAVILY_API_KEY_OVERRIDE || env.TAVILY_API_KEY;
if (!tavily) {
  console.error("MISSING TAVILY_API_KEY");
  process.exit(1);
}
console.log("tavily_key_len", tavily.length);

async function tavilySearch(query) {
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
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { parseError: true, body: text.slice(0, 800) };
  }
  return {
    query,
    http: res.status,
    answer: json.answer || null,
    results: (json.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      score: r.score,
      content: (r.content || "").slice(0, 700),
    })),
    error: json.error || json.detail || (!res.ok ? `http ${res.status} ${text.slice(0, 240)}` : null),
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
  "Higress MCP tool-level permission vs server-level open source AgentTeams",
];

const tavilyOut = [];
for (const q of queries) {
  console.log("TAVILY", q.slice(0, 72));
  try {
    tavilyOut.push(await tavilySearch(q));
  } catch (e) {
    tavilyOut.push({ query: q, error: String(e) });
  }
}

const payload = { stamp: new Date().toISOString(), tavily: tavilyOut };
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "goai-tavily-pass2.json");
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log("WROTE", outPath);
console.log(
  JSON.stringify({
    ok: tavilyOut.filter((x) => x.http === 200).length,
    fail: tavilyOut.filter((x) => x.http !== 200).length,
    answers: tavilyOut.filter((x) => x.answer).length,
  }),
);
