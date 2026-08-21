import fs from "node:fs";
const env = {};
for (const line of fs.readFileSync("C:/Users/jessi/Desktop/scoutbot/agent/.env", "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 1) continue;
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[t.slice(0, i).trim()] = v;
}
const q = "GOAI 2026 Agent Infra AgentTeams Hangzhou";
const bodies = [
  { name: "api_key_basic", headers: { "Content-Type": "application/json" }, body: { api_key: env.TAVILY_API_KEY, query: q, search_depth: "basic", max_results: 5, include_answer: true } },
  { name: "bearer_basic", headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.TAVILY_API_KEY }, body: { query: q, search_depth: "basic", max_results: 5, include_answer: true } },
];
for (const b of bodies) {
  const r = await fetch("https://api.tavily.com/search", { method: "POST", headers: b.headers, body: JSON.stringify(b.body) });
  const t = await r.text();
  console.log(b.name, r.status, t.slice(0, 500));
}
