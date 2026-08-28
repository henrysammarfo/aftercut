import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(p) {
  if (!existsSync(p)) return {};
  const o = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    o[m[1]] = v;
  }
  return o;
}
const env = { ...loadEnv(resolve("../scoutbot/agent/.env")), ...loadEnv(resolve(".env.local")) };
const key = (env.MINDS_BUILDER_API_KEY || "").trim();
const r = spawnSync(
  "npx",
  ["@animocabrands/minds-cli@latest", "--quiet", "mind", "show", "--mind", "6bf0483e-f36b-1410-8466-00039ce7df11"],
  { encoding: "utf8", timeout: 60_000, env: { ...process.env, MINDS_BUILDER_API_KEY: key }, shell: true },
);
console.log(r.stdout || r.stderr);
