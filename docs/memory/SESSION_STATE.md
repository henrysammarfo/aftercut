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

1. Browser E2E film path once (kit → soul → atomize → leash → day2)  
2. Hardened platform-native prompts + client QC scrub (do-not-say) on live drafts  
3. Pitch packaging (`docs/FILM_DEMO.md`) + pricing/stars re-check pitch day  
4. **Aug 10 AM first:** SCOUT mandatory go-live checklist  

**Not in jam critical path:** full Opus-style 9:16 reframe karaoke NLE (crowded video pipeline — see COMPETITIVE_RESEARCH).  

## SCOUT handoff (mandatory tomorrow)

All of: TST → unpaper → day1 → day1:live → leave loop · mid-window log tweaks  
