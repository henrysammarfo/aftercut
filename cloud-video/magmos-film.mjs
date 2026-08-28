/**
 * Magmos film preset → cloud-video/launch.mjs
 *
 *   $env:CURSOR_API_KEY = "crsr_..."   # shell only — never commit
 *   node cloud-video/magmos-film.mjs
 *
 * Does NOT run until you execute this file. Prep only in agent chats that say "don't execute".
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const launch = resolve(dir, "launch.mjs");
const promptFile = resolve(dir, "presets", "magmos-film.md");

const filmUrl = (process.env.MAGMOS_FILM_URL || "").trim();
let mergedEnv = {};
if (process.env.CLOUD_ENV_VARS) {
  try {
    const parsed = JSON.parse(process.env.CLOUD_ENV_VARS);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      mergedEnv = { ...parsed };
    }
  } catch {
    console.warn("[magmos-film] Ignoring invalid CLOUD_ENV_VARS JSON");
  }
}
if (filmUrl) mergedEnv.MAGMOS_FILM_URL = filmUrl;

const env = {
  ...process.env,
  // Magmoslabs/magmoslabs is private — Cloud Agent often cannot verify `main`.
  // Default shell = aftercut; prompt still films https://magmoslabs.vercel.app
  CLOUD_REPO:
    process.env.CLOUD_REPO || "https://github.com/henrysammarfo/aftercut",
  CLOUD_REF: process.env.CLOUD_REF || "main",
  CLOUD_NAME: process.env.CLOUD_NAME || "Magmos live site film",
  CLOUD_MODEL:
    process.env.CLOUD_MODEL || process.env.CURSOR_CLOUD_MODEL || "composer-2.5",
  CLOUD_PROMPT_FILE: process.env.CLOUD_PROMPT_FILE || promptFile,
  // Pass film entry URL into the cloud VM (never commit the token).
  ...(Object.keys(mergedEnv).length
    ? { CLOUD_ENV_VARS: JSON.stringify(mergedEnv) }
    : {}),
};

const r = spawnSync(process.execPath, [launch], {
  env,
  stdio: "inherit",
  cwd: process.cwd(),
});
process.exit(r.status ?? 1);
