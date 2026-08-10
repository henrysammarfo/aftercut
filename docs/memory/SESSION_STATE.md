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
mindId: [REDACTED]
isEnabled: true
cognition: ~79.6
npx tsx scripts/minds-smoke.ts
```

## Cloud film E2E (2026-08-10 · cursor/aftercut-live-film-e2e-aa1d)

| Beat | Result |
|---|---|
| 0 Landing `/` | ✓ |
| 1 Sign up `film+cloud{ts}@example.com` | ✓ → `/brand-kit` |
| 2 Brand kit Save + sync Soul (Northline Studio) | ✓ UI; sync hung in browser |
| 3 Ingest → Queue → Live atomize | ⚠ Mind reply timed out (~180s) |
| 4 Studio kanban advance | ✓ (no drafts — atomize failed) |
| 5 Post everything now | ✓ **PUBLISH DENIED** banner |
| 6 Live Day-2 follow-up | ⚠ Proactive parse failed (no JSON in reply) |
| 7 `/timeline` | ✓ Soul + leash receipts |
| 8 `/circle` | ✓ Director + Circle Minds |

**Artifacts:** video `aftercut-film-demo-walkthrough.mp4` · screenshots `beat-00`…`beat-08` in `/opt/cursor/artifacts/`.  
**Dev:** `npm run dev` → `http://localhost:8080/` · status bar live · Director · cog.

## Market validation (2026-08-09)

Full lock: [`COMPETITIVE_RESEARCH.md`](./COMPETITIVE_RESEARCH.md)  
**Verdict:** Clip SaaS + Whisper→LLM→FFmpeg OSS is crowded. Double down Mind Soul · native platform atoms · leash · Day-2. Do not rebuild Opus.

## Open (AFTERCUT sprint · public bar before Aug 28)

Production lock: **full live** Soul · native atoms · leash · Day-2 · ship ledger — not mock, not offline-default.

Code ready on **main** `acf49a5` (native prompts + live do-not-say scrub).

### Cloud film (Computer Use video Artifacts)

**2026-08-10:** Full walk recorded on Cloud Agent VM. Atomize/Day-2 Mind replies intermittently timeout or return non-JSON — investigate cognition / Telegram / prompt latency on hellominds.

1. Re-run atomize when Mind API stable (for kanban + Day-2 beats with drafts)  
2. Pitch packaging polish  
3. **Aug 10 AM first:** SCOUT mandatory go-live checklist  

**Not in jam critical path:** full Opus-style 9:16 reframe karaoke NLE (crowded video pipeline — see COMPETITIVE_RESEARCH).  

## SCOUT handoff (mandatory tomorrow)

All of: TST → unpaper → day1 → day1:live → leave loop · mid-window log tweaks  
