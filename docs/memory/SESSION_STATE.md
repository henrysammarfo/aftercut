# SESSION STATE — AFTERCUT

## Lock

- **Product:** AFTERCUT  
- **Mode:** **LIVE** hellominds Builder API  
- **Deadline:** 2026-08-28  
- **API:** `api.build.hellominds.ai` · `X-Api-Key`  
- **Keys:** `.env.local` has `MINDS_BUILDER_API_KEY` + `MINDS_DIRECTOR_MIND_ID` (gitignored)

## Parallel timer

| When | What |
|---|---|
| **Aug 10 morning** | SCOUT go-live checklist **mandatory full** (TST → unpaper → day1 → day1:live) — do not skip |
| **Now → Aug 9 night / post flip** | **AFTERCUT** jam product for **Aug 28** |

## Live path (code)

`src/lib/minds/{runtime,live,parse,prompts}.ts` · atomize/soul/proactive/leash via Director  

## Live smoke (2026-08-09)

```
ok: true
director: AFTERCUT.Director
mindId: 6bf0483e-f36b-1410-8466-00039ce7df11
isEnabled: true
cognition: ~171
npx tsx scripts/minds-smoke.ts
```

## Market validation (2026-08-09)

Full lock: [`COMPETITIVE_RESEARCH.md`](./COMPETITIVE_RESEARCH.md)  
**Verdict:** Clip SaaS + Whisper→LLM→FFmpeg OSS is crowded. Double down Mind Soul · native platform atoms · leash · Day-2. Do not rebuild Opus.

## Open (AFTERCUT sprint · public bar before Aug 28)

Production lock: **full live** Soul · native atoms · leash · Day-2 · ship ledger — not mock, not offline-default.

Code ready on **main** `acf49a5` (native prompts + live do-not-say scrub).

### Cloud film (Computer Use video Artifacts) — 2026-08-09 attempt

| Path | Result |
|---|---|
| In-chat Task `environment:cloud` | **Blocked** — multi-root workspace (aftercut+scoutbot) → “exactly one known git remote” |
| move_agent_to_root(aftercut) | **Blocked** — multi-repo cloud agent cannot pull into single-folder |
| Cloud Agents API | Script ready: `node scripts/launch-cloud-film.mjs` — needs **`CURSOR_API_KEY`** ([dashboard integrations](https://cursor.com/dashboard/integrations)); injects Minds keys via session `envVars` |
| cursor.com/agents browser | Requires interactive Cursor login (not signed in in agent browser) |

**Unblock 100% film:** paste `CURSOR_API_KEY` into shell (or open **Cloud** under agent input in an **aftercut-only** window) → run launch script → open returned `https://cursor.com/agents/bc-…` for desktop + video.

1. Launch Cloud film (above) — remaining  
2. Pitch packaging polish  
3. **Aug 10 AM first:** SCOUT mandatory go-live checklist  

**Not in jam critical path:** full Opus-style 9:16 reframe karaoke NLE (crowded video pipeline — see COMPETITIVE_RESEARCH).  

## SCOUT handoff (mandatory tomorrow)

All of: TST → unpaper → day1 → day1:live → leave loop · mid-window log tweaks  
