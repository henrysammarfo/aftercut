/**
 * Ask Director to publish creator-repurpose to the Bazaar (DevRel path).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const outDir = resolve(__dirname, "skill-build");
mkdirSync(outDir, { recursive: true });

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
const env = { ...loadEnv(resolve(root, "../scoutbot/agent/.env")), ...loadEnv(resolve(root, ".env.local")) };
const key = (env.MINDS_BUILDER_API_KEY || "").trim();
if (!key) {
  console.error("no key");
  process.exit(1);
}

const text = `Publish the Skill creator-repurpose to the Bazaar as "AFTERCUT Cut" (or keep the name creator-repurpose if renaming isn't ready) so other creators and Minds can equip it for content repurposing. Confirm when it is listed.`;

const r = spawnSync(
  "npx",
  ["@animocabrands/minds-cli@latest", "--quiet", "send", "aftercut-skill-build", "-", "--wait", "--timeout", "300000"],
  {
    cwd: root,
    encoding: "utf8",
    timeout: 330_000,
    input: text,
    env: { ...process.env, MINDS_BUILDER_API_KEY: key },
    shell: true,
  },
);
const stdout = r.stdout || "";
let parsed;
try {
  parsed = JSON.parse(stdout.trim());
} catch {
  parsed = { raw: stdout.slice(0, 12000) };
}
writeFileSync(resolve(outDir, "10-bazaar-publish.json"), JSON.stringify({ status: r.status, parsed }, null, 2));
const reply = (parsed?.reply?.messageText || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("status", r.status);
console.log(reply.slice(0, 1500));

const search = spawnSync(
  "npx",
  ["@animocabrands/minds-cli@latest", "--quiet", "bazaar", "search", "creator-repurpose"],
  {
    cwd: root,
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, MINDS_BUILDER_API_KEY: key },
    shell: true,
  },
);
writeFileSync(
  resolve(outDir, "11-bazaar-search-after.json"),
  JSON.stringify({ status: search.status, stdout: search.stdout }, null, 2),
);
console.log("bazaar search:", (search.stdout || "").slice(0, 800));
