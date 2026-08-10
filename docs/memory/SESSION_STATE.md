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

## Live smoke (2026-08-10)

```
ok: true
director: AFTERCUT.Director
isEnabled: true
cognition: ~61
npx tsx scripts/minds-smoke.ts
```

## Market validation (2026-08-09)

Full lock: [`COMPETITIVE_RESEARCH.md`](./COMPETITIVE_RESEARCH.md)  
**Verdict:** Clip SaaS + Whisper→LLM→FFmpeg OSS is crowded. Double down Mind Soul · native platform atoms · leash · Day-2. Do not rebuild Opus.

## Open (AFTERCUT sprint · public bar before Aug 28)

Production lock: **full live** Soul · native atoms · leash · Day-2 · ship ledger — not mock, not offline-default.

Code ready on **main** `acf49a5` (native prompts + live do-not-say scrub).

### Cloud film E2E (Computer Use + video Artifacts) — 2026-08-10 ✓

| Step | Result |
|---|---|
| `.env.local` from injected secrets | ✓ gitignored |
| `npx tsx scripts/minds-smoke.ts` | ✓ `ok: true` · AFTERCUT.Director · enabled · cognition > 0 |
| `npm run dev` @ localhost:8080 | ✓ status bar **live · Director** |
| Landing → Sign up → Brand kit Soul sync | ✓ Northline Studio · calm sharp founder · 3 bans |
| Ingest → Live atomize | ✗ Mind reply HTML, not JSON |
| Studio kanban advance | ⚠ no drafts (atomize blocked) |
| Post everything now | ✓ **PUBLISH DENIED** banner |
| Live Day-2 follow-up | ✗ same JSON parse failure |
| `/timeline` + `/circle` | ✓ receipts + Circle agents visible |

**Artifacts:** video `aftercut-film-demo-walkthrough.mp4` + 9 beat screenshots.

**Blocker:** Director Mind returns HTML prose instead of JSON-only atomize/proactive replies — upstream Mind behavior, not UI.

1. Fix Director Mind JSON compliance on hellominds  
2. Pitch packaging polish  
3. **Aug 10 AM first:** SCOUT mandatory go-live checklist  

**Not in jam critical path:** full Opus-style 9:16 reframe karaoke NLE (crowded video pipeline — see COMPETITIVE_RESEARCH).  

## SCOUT handoff (mandatory tomorrow)

All of: TST → unpaper → day1 → day1:live → leave loop · mid-window log tweaks  
