import { readFileSync, existsSync } from "node:fs";

function names(file) {
  if (!existsSync(file)) return new Set();
  const out = new Set();
  for (const line of readFileSync(file, "utf8").split(/\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const k = t.slice(0, t.indexOf("=")).trim();
    let v = t.slice(t.indexOf("=") + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    if (k && v.length > 4) out.add(k);
  }
  return out;
}

const local = names("C:/Users/jessi/Desktop/aftercut/.env.local");
const requiredProd = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "MINDS_BUILDER_API_KEY",
  "AGENT_ROUTER_API_KEY",
  "TAVILY_API_KEY",
  "TINYFISH_API_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TELEGRAM_WEBHOOK_SECRET",
];
const optional = [
  "MINDS_DIRECTOR_MIND_ID",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_DEFAULT_USER_ID",
  "TOKEN_ENCRYPTION_KEY",
  "CURSOR_API_KEY",
  "AGENT_ROUTER_ANTHROPIC_MODEL",
  "AGENT_ROUTER_OPENAI_MODEL",
];

console.log("=== LOCAL .env.local ===");
for (const k of [...requiredProd, ...optional]) {
  console.log((local.has(k) ? "OK " : "NO ") + k);
}
