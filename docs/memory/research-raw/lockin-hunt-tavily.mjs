import fs from "node:fs";
function loadEnv(p) {
  const env = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[t.slice(0, i).trim()] = v;
  }
  return env;
}
const env = loadEnv("C:/Users/jessi/Desktop/scoutbot/agent/.env");
const key = env.TAVILY_API_KEY;
async function search(query, include_domains) {
  const body = { api_key: key, query, search_depth: "advanced", max_results: 6, include_answer: true };
  if (include_domains) body.include_domains = include_domains;
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return {
    query,
    http: res.status,
    answer: json.answer || null,
    results: (json.results || []).map((r) => ({ title: r.title, url: r.url, content: (r.content || "").slice(0, 420) })),
    error: json.detail || json.error || (!res.ok ? res.status : null),
  };
}
const jobs = [
  search("Typhoon Dolphin 2026 Japan JMA intensity very strong 85 kt landfall forecast", ["jma.go.jp", "nrlmry.navy.mil", "nhc.noaa.gov", "reuters.com", "thejapanesetimes.com", "japantimes.co.jp", "accuweather.com"]),
  search("Typhoon Dolphin August 2026 track Japan Joint Typhoon Warning Center"),
  search("global average number of magnitude 4.5 earthquakes per day USGS 2026"),
  search("Tesla TSLA stock price August 15 2026"),
  search("Ethereum ETH CoinGecko price August 15 2026", ["coingecko.com", "reuters.com"]),
  search("Al Ittihad vs Al Kholood Saudi Pro League August 15 2026 result score", ["reuters.com", "espn.com", "bbc.com"]),
];
const out = [];
for (const j of jobs) out.push(await j);
fs.writeFileSync("C:/Users/jessi/Desktop/aftercut/docs/memory/research-raw/lockin-hunt-tavily.json", JSON.stringify({ stamp: new Date().toISOString(), out }, null, 2));
console.log(JSON.stringify(out.map((x) => ({ q: x.query.slice(0, 60), http: x.http, answer: (x.answer || "").slice(0, 280), n: (x.results || []).length, err: x.error })), null, 2));
