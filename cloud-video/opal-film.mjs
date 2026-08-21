/**
 * OPAL film preset → cloud-video/launch.mjs
 *
 *   $env:CURSOR_API_KEY = "crsr_..."
 *   node cloud-video/opal-film.mjs
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const launch = resolve(dir, "launch.mjs");
const promptFile = resolve(dir, "presets", "opal-film.md");

const env = {
  ...process.env,
  CLOUD_REPO:
    process.env.CLOUD_REPO || "https://github.com/henrysammarfo/tryopal",
  CLOUD_REF: process.env.CLOUD_REF || "main",
  CLOUD_NAME: process.env.CLOUD_NAME || "OPAL dashboard film v2 (post QA)",
  CLOUD_ENV_VARS:
    process.env.CLOUD_ENV_VARS ||
    JSON.stringify({
      OPAL_FILM_EMAIL: "film-demo@tryopal.asia",
      OPAL_FILM_PASSWORD: "OpalFilm!2026",
    }),
  CLOUD_MODEL:
    process.env.CLOUD_MODEL ||
    process.env.CURSOR_CLOUD_MODEL ||
    "composer-2.5",
  CLOUD_PROMPT_FILE: process.env.CLOUD_PROMPT_FILE || promptFile,
};

const r = spawnSync(process.execPath, [launch], {
  env,
  stdio: "inherit",
  cwd: process.cwd(),
});
process.exit(r.status ?? 1);
