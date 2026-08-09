/**
 * Launch Cursor Cloud Agent (Computer Use + video Artifacts) for AFTERCUT film E2E.
 *
 * Requires: CURSOR_API_KEY from https://cursor.com/dashboard/integrations
 * Secrets: MINDS_BUILDER_API_KEY (+ optional MINDS_DIRECTOR_MIND_ID) in env or .env.local
 *
 * Usage (PowerShell):
 *   $env:CURSOR_API_KEY = "cursor_..."
 *   node scripts/launch-cloud-film.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, eq).trim()] = v;
  }
  return out;
}

const dotenv = loadDotEnvLocal();
const cursorKey = (process.env.CURSOR_API_KEY || "").trim();
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

if (!cursorKey) {
  console.error(
    "Missing CURSOR_API_KEY. Create one at https://cursor.com/dashboard/integrations then set it in the shell.",
  );
  process.exit(1);
}
if (!mindsKey) {
  console.error("Missing MINDS_BUILDER_API_KEY (env or .env.local).");
  process.exit(1);
}

const promptText = `Mission: 100% LIVE AFTERCUT film via Computer Use + video Artifacts.

Repo already checked out: henrysammarfo/aftercut @ main.

1) Write gitignored .env.local from injected env vars MINDS_BUILDER_API_KEY and MINDS_DIRECTOR_MIND_ID (already in shell env — do not print keys).
2) npm install; npx tsx scripts/minds-smoke.ts → ok:true, Director enabled.
3) npm run dev; open browser on the Local URL.
4) COMPUTER USE full film path from docs/FILM_DEMO.md:
   - Landing → Sign up (unique email film+cloud{ts}@example.com / FilmDemo!2026)
   - /brand-kit Save+sync Soul (Northline Studio; tone calm sharp founder; ban: overnight riches, set and forget spam, guaranteed virality)
   - /ingest paste long-form → Queue → Live atomize
   - /studio advance cards → Post everything now (PUBLISH DENIED) → Live Day-2 follow-up
   - /timeline + /circle
5) Produce video Artifact of the full walk + screenshots of each beat.
6) Do NOT commit secrets. Branch cursor/* ok; auto PR optional summary only (no keys).

Long-form for ingest:
Last week we closed a 90-minute founder AMA on shipping multi-surface content without losing brand DNA. Three takeaways: (1) native hooks beat identical cross-posts; (2) human approve gate; (3) overnight follow-up with memory wins. Shorts under 90 chars; X one claim; LinkedIn lessons; newsletter subject as preview. Never promise guaranteed virality. CTA: reply with your long-form.
`;

const body = {
  name: "AFTERCUT live film E2E",
  prompt: { text: promptText },
  repos: [
    {
      url: "https://github.com/henrysammarfo/aftercut",
      startingRef: "main",
    },
  ],
  autoCreatePR: false,
  workOnCurrentBranch: false,
  envVars: {
    MINDS_BUILDER_API_KEY: mindsKey,
    ...(directorId ? { MINDS_DIRECTOR_MIND_ID: directorId } : {}),
  },
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
      agentId,
      runId,
      url: agentUrl,
      hint: "Open url for Computer Use live desktop + Artifacts (video).",
    },
    null,
    2,
  ),
);
