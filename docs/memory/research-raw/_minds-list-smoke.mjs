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
const root = resolve(".");
const env = { ...loadEnv(resolve("../scoutbot/agent/.env")), ...loadEnv(resolve(".env.local")) };
const key = (env.MINDS_BUILDER_API_KEY || "").trim();
console.log("hasKey", Boolean(key), "len", key.length);
const r = spawnSync("npx", ["@animocabrands/minds-cli@latest", "--quiet", "list"], {
  cwd: root,
  encoding: "utf8",
  timeout: 60_000,
  env: { ...process.env, MINDS_BUILDER_API_KEY: key },
  shell: true,
});
console.log("status", r.status);
console.log((r.stdout || "").slice(0, 2000));
console.log((r.stderr || "").slice(0, 500));
