/**
 * Guide Director Mind through AFTERCUT Cut Skill build (DevRel path).
 * Does not print secrets. Usage: node docs/memory/research-raw/_build-aftercut-skill.mjs
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
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    o[m[1]] = v;
  }
  return o;
}

const env = {
  ...loadEnv(resolve(root, "../scoutbot/agent/.env")),
  ...loadEnv(resolve(root, ".env.local")),
  ...process.env,
};

const key = (env.MINDS_BUILDER_API_KEY || "").trim();
if (!key) {
  console.error("MINDS_BUILDER_API_KEY missing (.env.local or scoutbot/agent/.env)");
  process.exit(1);
}

const ALIAS = "aftercut-skill-build";

function minds(args, timeoutMs = 60_000) {
  const r = spawnSync(
    "npx",
    ["@animocabrands/minds-cli@latest", "--quiet", ...args],
    {
      cwd: root,
      encoding: "utf8",
      timeout: timeoutMs,
      env: { ...process.env, MINDS_BUILDER_API_KEY: key },
      shell: true,
    },
  );
  const stdout = r.stdout || "";
  const stderr = r.stderr || "";
  if (r.status !== 0 && r.error) {
    return { ok: false, error: String(r.error), stdout, stderr, status: r.status };
  }
  let parsed = null;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").filter(Boolean).pop() || "{}");
  } catch {
    parsed = { raw: stdout };
  }
  return { ok: r.status === 0, status: r.status, parsed, stdout, stderr };
}

function save(name, data) {
  writeFileSync(resolve(outDir, name), JSON.stringify(data, null, 2), "utf8");
}

console.log("1) list minds…");
const listed = minds(["list", "--pretty"]);
save("01-list.json", listed);
if (!listed.ok) {
  console.error("list failed", listed.stderr || listed.stdout);
  process.exit(1);
}

const mindsArr =
  listed.parsed?.minds ||
  listed.parsed?.data?.minds ||
  listed.parsed?.data ||
  (Array.isArray(listed.parsed) ? listed.parsed : null) ||
  [];

// CLI envelopes vary — dump keys for debug without secrets
const topKeys = listed.parsed && typeof listed.parsed === "object" ? Object.keys(listed.parsed) : [];
console.log("list keys:", topKeys.join(","));

let mindId = (env.MINDS_DIRECTOR_MIND_ID || "").trim();
let mindName = "";
const rows = Array.isArray(mindsArr)
  ? mindsArr
  : listed.parsed?.ok && Array.isArray(listed.parsed.result)
    ? listed.parsed.result
    : [];

if (!rows.length && listed.parsed?.result && Array.isArray(listed.parsed.result)) {
  // already handled
}

// Try common shapes
function extractMinds(obj) {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj)) return obj;
  for (const k of ["items", "minds", "result", "data"]) {
    if (Array.isArray(obj[k])) return obj[k];
    if (obj[k]?.minds && Array.isArray(obj[k].minds)) return obj[k].minds;
    if (obj[k]?.items && Array.isArray(obj[k].items)) return obj[k].items;
  }
  return [];
}

const all = extractMinds(listed.parsed);
console.log("minds count:", all.length);
if (all[0]) {
  console.log(
    "first mind:",
    all[0].mindId?.slice?.(0, 8) || all[0].id?.slice?.(0, 8),
    all[0].name,
  );
}

if (!mindId && all.length) {
  const hit =
    all.find((m) => /aftercut|director/i.test(m.name || "")) ||
    all.find((m) => m.isEnabled !== false) ||
    all[0];
  mindId = hit.mindId || hit.id;
  mindName = hit.name || "";
} else if (mindId && all.length) {
  const hit = all.find((m) => m.mindId === mindId || m.id === mindId);
  mindName = hit?.name || "";
}

if (!mindId) {
  console.error("No mindId — awaken a Mind first");
  process.exit(1);
}
console.log("using mind:", mindId.slice(0, 8), mindName || "(name n/a)");

console.log("2) ensure chat alias", ALIAS);
const created = minds([
  "chat",
  "create",
  "--mind",
  mindId,
  "--alias",
  ALIAS,
]);
save("02-chat-create.json", created);
console.log("chat create ok:", created.ok, created.status);

const DESCRIBE = `Build me a Skill called "AFTERCUT Cut" for creator content repurposing.

Input I will give you each run:
1) Brand DNA — voice, taboos, logo/colors/fonts notes, audience
2) Source dump — transcript notes, title, platform hints (never invent quotes)
3) Optional live context — trends or verified updates I already fetched

Output every time, short and structured:
- What changed / what the source is about (1–2 lines)
- Why it matters for THIS creator's DNA (cite taboos/voice)
- Cuts: Shorts hook, X post, LinkedIn post, newsletter blurb — each in brand voice, no invented quotes from the dump
- QC: one line if anything risks spam, dupe, or taboo breach

Remember my approve/reject feedback so later cycles get sharper.
Do not call any external APIs or my AFTERCUT servers — reason only on what I paste in.`;

const REFINE = `Group cuts by platform. Keep Shorts under 20 words for the hook. Flag any taboo hits before the cuts.`;

const BUILD = `That's it. Build it.`;

const INSPECT = `Show me what this Skill can do, what it reads, and what it can change. Flag anything it should not touch.`;

function sendWait(label, text, timeoutMs) {
  console.log(`send (${label}) timeout=${timeoutMs}ms…`);
  // Pass text via stdin to avoid PowerShell/arg length issues
  const r = spawnSync(
    "npx",
    [
      "@animocabrands/minds-cli@latest",
      "--quiet",
      "send",
      ALIAS,
      "-",
      "--wait",
      "--timeout",
      String(timeoutMs),
    ],
    {
      cwd: root,
      encoding: "utf8",
      timeout: timeoutMs + 30_000,
      input: text,
      env: { ...process.env, MINDS_BUILDER_API_KEY: key },
      shell: true,
    },
  );
  const stdout = r.stdout || "";
  const stderr = r.stderr || "";
  let parsed = null;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").filter(Boolean).pop() || "{}");
  } catch {
    parsed = { raw: stdout.slice(0, 8000) };
  }
  const result = {
    ok: r.status === 0,
    status: r.status,
    error: r.error ? String(r.error) : null,
    parsed,
    stderr: stderr.slice(0, 4000),
    stdoutLen: stdout.length,
  };
  save(`${label}.json`, result);
  const reply =
    parsed?.reply?.text ||
    parsed?.replyText ||
    parsed?.message?.text ||
    parsed?.data?.reply ||
    parsed?.result?.text ||
    (typeof parsed?.raw === "string" ? parsed.raw.slice(0, 500) : null);
  console.log(`  ok=${result.ok} replyPreview=`, (reply || "(none)").slice(0, 240).replace(/\s+/g, " "));
  return result;
}

const d = sendWait("03-describe", DESCRIBE, 300_000);
const r = sendWait("04-refine", REFINE, 300_000);
const b = sendWait("05-build", BUILD, 300_000);
const i = sendWait("06-inspect", INSPECT, 240_000);

console.log("7) list equipped skills…");
const skills = minds(["mind", "skills", "list", "--mind", mindId, "--pretty"]);
save("07-skills.json", skills);

console.log("8) bazaar search AFTERCUT…");
const bazaar = minds(["bazaar", "search", "AFTERCUT Cut", "--pretty"]);
save("08-bazaar.json", bazaar);

const summary = {
  mindId,
  mindName,
  alias: ALIAS,
  describeOk: d.ok,
  refineOk: r.ok,
  buildOk: b.ok,
  inspectOk: i.ok,
  skillsOk: skills.ok,
  bazaarOk: bazaar.ok,
  outDir,
};
save("00-summary.json", summary);
console.log(JSON.stringify(summary, null, 2));
