/**
 * Smoke-run creator-repurpose skill on AFTERCUT.Director
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

const text = `REPURPOSE
Source: Founder AMA takeaway — creators burn hours re-cutting the same VOD for Shorts, X, LinkedIn, and newsletter. Tools clip once and forget the brand. Overnight follow-up is the gap.
Voice: calm, sharp founder; ban overnight riches, set-and-forget spam, invented quotes
Examples: Ship the cut. Skip the fluff. Opus clips once. AFTERCUT remembers your DNA.
Primary platform: shorts
Live context: Creative Minds Jam judges want Mind-integral persistence, not identity-only wrappers.`;

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
writeFileSync(resolve(outDir, "09-smoke-repurpose.json"), JSON.stringify({ status: r.status, parsed }, null, 2));
const reply = parsed?.reply?.messageText || "";
const plain = reply.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("status", r.status);
console.log("len", plain.length);
console.log(plain.slice(0, 1200));
