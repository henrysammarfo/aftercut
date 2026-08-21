/**
 * Generic Cursor Cloud Agent launcher — Computer Use + video Artifacts.
 * Folder: aftercut/cloud-video  (point other chats here)
 *
 *   node cloud-video/launch.mjs
 * Docs: cloud-video/README.md
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const AFTERCUT_ROOT = resolve(SCRIPT_DIR, "..");

function loadEnvFiles() {
  const out = {};
  const files = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(AFTERCUT_ROOT, ".env.local"),
    resolve(AFTERCUT_ROOT, ".env"),
  ];
  for (const p of files) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const k = t.slice(0, eq).trim();
      if (out[k]) continue; // first wins (cwd over repo root)
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (k && v) out[k] = v;
    }
  }
  return out;
}

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing ${name}. See cloud-video/README.md and env.example`);
    process.exit(1);
  }
  return value;
}

const dotenv = loadEnvFiles();
const cursorKey = requireEnv(
  "CURSOR_API_KEY",
  (process.env.CURSOR_API_KEY || dotenv.CURSOR_API_KEY || "").trim(),
);

const repoUrl = requireEnv(
  "CLOUD_REPO",
  (
    process.env.CLOUD_REPO ||
    process.env.CURSOR_CLOUD_REPO ||
    "https://github.com/henrysammarfo/aftercut"
  ).trim(),
);

const startingRef = (
  process.env.CLOUD_REF ||
  process.env.CURSOR_CLOUD_REF ||
  "main"
).trim();

const modelId = (
  process.env.CLOUD_MODEL ||
  process.env.CURSOR_CLOUD_MODEL ||
  "composer-2.5"
).trim();

const name = (
  process.env.CLOUD_NAME ||
  process.env.CURSOR_CLOUD_NAME ||
  "Cloud video Computer Use"
)
  .trim()
  .slice(0, 100);

let promptText = (process.env.CLOUD_PROMPT || "").trim();
const promptFile = (process.env.CLOUD_PROMPT_FILE || "").trim();
if (!promptText && promptFile) {
  const abs = resolve(process.cwd(), promptFile);
  const alt = resolve(SCRIPT_DIR, promptFile);
  const path = existsSync(abs) ? abs : alt;
  if (!existsSync(path)) {
    console.error(`CLOUD_PROMPT_FILE not found: ${promptFile}`);
    process.exit(1);
  }
  promptText = readFileSync(path, "utf8").trim();
}
if (!promptText) {
  promptText = [
    "Mission: Computer Use + video Artifacts (not screenshots-only).",
    `Repo: ${repoUrl} @ ${startingRef}.`,
    "1) Install deps, start the app, open a real browser on the desktop.",
    "2) Click through a full end-to-end demo of the product.",
    "3) Produce a continuous video Artifact of the walk plus key screenshots.",
    "4) Never commit secrets. Report agent url + what you filmed.",
  ].join("\n");
}

const envVars = {};
const mindsKey = (
  process.env.MINDS_BUILDER_API_KEY ||
  dotenv.MINDS_BUILDER_API_KEY ||
  ""
).trim();
const directorId = (
  process.env.MINDS_DIRECTOR_MIND_ID ||
  dotenv.MINDS_DIRECTOR_MIND_ID ||
  ""
).trim();
if (mindsKey) envVars.MINDS_BUILDER_API_KEY = mindsKey;
if (directorId) envVars.MINDS_DIRECTOR_MIND_ID = directorId;

const extraJson = (process.env.CLOUD_ENV_VARS || "").trim();
if (extraJson) {
  try {
    const parsed = JSON.parse(extraJson);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed)) {
        if (
          typeof k === "string" &&
          typeof v === "string" &&
          !k.startsWith("CURSOR_")
        ) {
          envVars[k] = v;
        }
      }
    }
  } catch (e) {
    console.error("CLOUD_ENV_VARS must be a JSON object of string values:", e.message);
    process.exit(1);
  }
}

const body = {
  name,
  prompt: { text: promptText },
  model: { id: modelId },
  repos: [{ url: repoUrl, startingRef }],
  autoCreatePR: process.env.CLOUD_AUTO_PR === "true",
  workOnCurrentBranch: false,
  ...(Object.keys(envVars).length ? { envVars } : {}),
};

const res = await fetch("https://api.cursor.com/v1/agents", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${cursorKey}:`).toString("base64")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = { raw: text };
}

if (!res.ok) {
  console.error("Cloud agent create failed", res.status, json);
  process.exit(1);
}

const agentUrl = json.agent?.url || json.url || null;
const agentId = json.agent?.id || json.agentId || null;
const runId = json.run?.id || json.latestRunId || null;

console.log(
  JSON.stringify(
    {
      ok: true,
      name,
      model: modelId,
      repo: repoUrl,
      ref: startingRef,
      agentId,
      runId,
      url: agentUrl,
      envVarNames: Object.keys(envVars),
      hint: "Open url → Computer Use desktop + Artifacts (video).",
    },
    null,
    2,
  ),
);
