/**
 * Fix missing Telegram + encryption env on local + Vercel.
 * Never prints secret values.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
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
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
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
  else text = text.trimEnd() + "\n" + line + "\n";
  writeFileSync(path, text, "utf8");
}

function vercelAdd(key, value, environment) {
  const r = spawnSync(
    "npx",
    ["vercel", "env", "add", key, environment, "--force"],
    {
      cwd: "C:/Users/jessi/Desktop/aftercut",
      encoding: "utf8",
      shell: true,
      input: value + "\n",
    },
  );
  console.log(key, environment, r.status === 0 ? "OK" : "FAIL");
  if (r.status !== 0) console.log((r.stderr || r.stdout || "").slice(0, 200));
  return r.status === 0;
}

const localPath = "C:/Users/jessi/Desktop/aftercut/.env.local";
const local = parseEnv(localPath);

const tokenEnc =
  local.TOKEN_ENCRYPTION_KEY || randomBytes(32).toString("base64");
const botToken = local.TELEGRAM_BOT_TOKEN || "";

// Prefer existing default user id; else try Neon first user
let defaultUser = local.TELEGRAM_DEFAULT_USER_ID || "";
if (!defaultUser && local.DATABASE_URL) {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(local.DATABASE_URL);
    const rows = await sql`select id from "user" order by created_at asc limit 1`;
    if (rows[0]?.id) {
      defaultUser = String(rows[0].id);
      console.log("defaultUser from Neon first user");
    } else {
      console.log("Neon has 0 users — TELEGRAM_DEFAULT_USER_ID skipped until signup");
    }
  } catch (e) {
    console.log("Neon lookup failed:", e instanceof Error ? e.message : String(e));
  }
}

const pairs = {
  TOKEN_ENCRYPTION_KEY: tokenEnc,
};
if (botToken) pairs.TELEGRAM_BOT_TOKEN = botToken;
if (defaultUser) pairs.TELEGRAM_DEFAULT_USER_ID = defaultUser;

for (const [k, v] of Object.entries(pairs)) {
  upsertLocal(localPath, k, v);
  console.log("LOCAL", k, "len=" + v.length);
  for (const env of ["production", "preview"]) {
    vercelAdd(k, v, env);
  }
}

console.log("done");
