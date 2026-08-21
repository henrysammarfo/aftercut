/**
 * AXIS finale film preset → cloud-video/launch.mjs
 *
 *   $env:CURSOR_API_KEY = "crsr_..."
 *   node cloud-video\axis-film.mjs
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const launch = resolve(dir, "launch.mjs");
const promptFile = resolve(dir, "presets", "axis-film.md");

const env = {
  ...process.env,
  CLOUD_REPO:
    process.env.CLOUD_REPO || "https://github.com/henrysammarfo/axis",
  CLOUD_REF: process.env.CLOUD_REF || "main",
  CLOUD_NAME: process.env.CLOUD_NAME || "AXIS finale film (UA / ZeroDev / Magic)",
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
