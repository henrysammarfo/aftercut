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
const tf = env.TINYFISH_API_KEY;
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
    tool: "tavily",
    query,
    http: res.status,
    answer: json.answer || null,
    results: (json.results || []).map((r) => ({ title: r.title, url: r.url, content: (r.content || "").slice(0, 500) })),
  };
}
async function tiny(url, goal) {
  const res = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": tf },
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
  return { tool: "tinyfish", url, http: res.status, extract: (extract || raw).slice(0, 6000) };
}
const tav = await Promise.all([
  search("Al Ittihad vs Al Kholood August 15 2026 final score result Saudi Pro League", ["espn.com", "bbc.com", "reuters.com", "sofascore.com"]),
  search("Mississippi River discharge Baton Rouge USGS cubic feet per second August 15 2026", ["usgs.gov", "waterdata.usgs.gov", "noaa.gov"]),
  search("FA Community Shield 16 August 2026 Arsenal Manchester City both teams to score preview", ["bbc.com", "arsenal.com", "mancity.com", "reuters.com"]),
  search("Wikipedia Chess article daily pageviews August 2026", ["wikimedia.org", "pageviews.wmcloud.org", "wikipedia.org"]),
  search("Tesla TSLA stock price Friday August 14 2026 close", ["finance.yahoo.com", "stockanalysis.com"]),
  search("Ethereum ETH USD CoinGecko August 15 2026", ["coingecko.com"]),
]);
const pages = await Promise.all([
  tiny("https://www.espn.com/soccer/match/_/gameId/401900403/al-kholood-al-ittihad", "Extract final score, status (FT/live), date, whether the match was a draw. Quote the scoreline."),
  tiny("https://waterdata.usgs.gov/monitoring-location/07374000/#parameterCode=00060", "Extract latest Mississippi River discharge at Baton Rouge USGS 07374000 in cubic feet per second, timestamp, and recent values vs 220000 cfs."),
  tiny("https://www.bbc.com/sport/football/community-shield", "FA Community Shield Arsenal vs Manchester City 16 August 2026: kickoff, odds or preview on both teams to score, injuries if stated."),
]);
const payload = { stamp: new Date().toISOString(), tav, pages };
fs.writeFileSync("C:/Users/jessi/Desktop/aftercut/docs/memory/research-raw/lockin-hunt-satnight.json", JSON.stringify(payload, null, 2));
console.log(JSON.stringify({
  tav: tav.map((x) => ({ q: x.query.slice(0, 50), http: x.http, answer: (x.answer || "").slice(0, 220) })),
  tf: pages.map((x) => ({ url: x.url, http: x.http, extract: (x.extract || "").slice(0, 350) })),
}, null, 2));
