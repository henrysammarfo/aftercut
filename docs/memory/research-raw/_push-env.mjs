/**
 * Push research + AgentRouter keys to aftercut .env.local and Vercel production/preview.
 * Reads secrets from scoutbot agent/.env + AGENT_ROUTER from argv / env — never prints values.
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function parseEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && v) out[k] = v;
  }
  return out;
}

function upsertLocal(path, key, value) {
  let text = existsSync(path) ? readFileSync(path, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (re.test(text)) text = text.replace(re, line);
  else text = text.trimEnd() + (text.endsWith("\n") || !text ? "" : "\n") + line + "\n";
  writeFileSync(path, text, "utf8");
}

function vercelAdd(key, value, environment) {
  const r = spawnSync(
    "npx",
    ["vercel", "env", "add", key, environment, "--force", "--value", value],
    {
      cwd: resolve("C:/Users/jessi/Desktop/aftercut"),
      encoding: "utf8",
      shell: true,
    },
  );
  // Older CLI may not support --value; fall back to stdin pipe
  if (r.status !== 0) {
    const r2 = spawnSync(
      "npx",
      ["vercel", "env", "add", key, environment, "--force"],
      {
        cwd: resolve("C:/Users/jessi/Desktop/aftercut"),
        encoding: "utf8",
        shell: true,
        input: value + "\n",
      },
    );
    if (r2.status !== 0) {
      console.error("FAIL", key, environment, (r2.stderr || r2.stdout || "").slice(0, 400));
      return false;
    }
  }
  console.log("OK", key, environment);
  return true;
}

const scout = parseEnv("C:/Users/jessi/Desktop/scoutbot/agent/.env");
const localPath = "C:/Users/jessi/Desktop/aftercut/.env.local";
const router =
  process.env.AGENT_ROUTER_API_KEY ||
  process.argv.find((a) => a.startsWith("sk-")) ||
  "";

const pairs = {
  TAVILY_API_KEY: scout.TAVILY_API_KEY,
  TINYFISH_API_KEY: scout.TINYFISH_API_KEY,
  AGENT_ROUTER_API_KEY: router,
  ANTHROPIC_AUTH_TOKEN: router,
  AGENT_ROUTER_OPENAI_BASE: "https://agentrouter.org/v1",
  AGENT_ROUTER_ANTHROPIC_BASE: "https://agentrouter.org",
};

for (const [k, v] of Object.entries(pairs)) {
  if (!v) {
    console.log("SKIP missing", k);
    continue;
  }
  upsertLocal(localPath, k, v);
  console.log("LOCAL", k, "len=" + String(v).length);
}

for (const env of ["production", "preview"]) {
  for (const [k, v] of Object.entries(pairs)) {
    if (!v) continue;
    vercelAdd(k, v, env);
  }
}

console.log("done");
