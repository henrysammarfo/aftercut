# Film demo bugs — 2026-08-23 first pass

Recorded on branch `cursor/aftercut-live-film-e2e-6e11`. This is the post-demo error list (presentation + product + Mind). Unverified Mind behavior is marked.

## Presentation (why the first film looked wrong)

1. **Browser not maximized.** Chrome sat in a floating window; desktop wallpaper, dock, and clock showed around the app. The product never filled the frame.
2. **No zoom.** Key beats (status badge, Publish denied banner, Day-2 button) were never zoomed. Judges would need to squint at 10px sidebar text.
3. **Cursor not used as a pointer.** The pointer was often idle in the URL bar or dead center instead of hovering the control being explained, then clicking.
4. **Chrome “Relaunch to update” pill** stayed in the top-right of every shot.
5. **Two Vite ports.** After restart, `8080` stayed occupied and the film moved to `8081` without a clean single Local URL.
6. **Studio second recording failed (X11).** Follow-up studio beats were screenshots-only; no second video of publish-denied / Day-2.
7. **Seeded kanban cards.** After live atomize failed, drafts were injected via `localStorage` so Studio looked populated. That is not a live Mind cut — do not treat those cards as product output.

## Product / build bugs hit during the walk

| # | Where | What happened |
|---|---|---|
| P1 | `src/lib/require-auth.ts` | Vite **import-protection**: client bundle pulled `@tanstack/react-start/server`. Error overlay on `/signup`, `/login`, `/studio`, `/brand-kit`. **Fixed** this branch (client session gate only). |
| P2 | Copy vs film script | UI says **Publish all now** / **Improve weakest hook** / **Generate drafts** / **Add to queue**. `docs/FILM_DEMO.md` still says **Post everything now** / **Live Day-2 follow-up** / **Live atomize** / **Queue**. Operators miss the buttons. |
| P3 | Setup progress | After seeded drafts, **First import** stayed unchecked while **Review drafts** was checked. `setup-progress` marks ingest done only if `status === "atomized"` or `beatCount > 0`. CTA still said **Continue: First import**. |
| P4 | Studio kanban | **Needs approval (4)** with a fifth card off-screen; no scroll hint. Tight 5-column grid clips on a non-maximized window. |
| P5 | `tsx -e` one-liners | `ERR_PACKAGE_PATH_NOT_EXPORTED` for `@animocabrands/minds-client-lib` under tsx CJS eval. `npx tsx scripts/*.ts` works; inline `-e` does not. |
| P6 | Local vs cloud auth | No `DATABASE_URL` / `BETTER_AUTH_SECRET` in this env. Signup is **localStorage** (`aftercut_session_v1`), not Better Auth. Fine for local film; not the Vercel cloud path. |
| P7 | Landing hero | Full-bleed video + dark-on-light headline at small breakpoints; in a small Chrome window the hero crops and the “WHY AFTERCUT” card sits over the fold. |

## Live Mind (Director) — observed this session

Smoke was green: `ok: true`, Director enabled, cognition ~1171.

| # | Call | Observed |
|---|---|---|
| M1 | `atomizeLive` / Generate drafts | Parse error **No JSON object/array in Mind reply**. Raw reply was prose refusing to regenerate (“I'm not regenerating under that pressure… six drafts in CD18493E”). UI: “Your agent returned an unexpected response.” |
| M2 | Repeat atomize on new `userId` aliases | Same refusal, counted as “twenty-fifth version of the same shape.” Conversation isolation by `aftercut_${userId}` did **not** reset Director memory of the prompt. |
| M3 | `syncSoulLive` after probe load | **Timeout** at 120s: “Your agent took too long to respond.” Browser Save brand voice also sat on **Saving…** for a long stretch (Soul sync is the same `talkToDirector` path). |
| M4 | `proactiveLive` / Improve weakest hook | **Proactive parse failed: No JSON object/array in Mind reply.** Same non-JSON conversational reply. |
| M5 | Leash | **Publish all now** still works without Mind JSON. Banner: “Publishing blocked / Bulk publish blocked — N drafts still need approval.” This beat is independent of atomize. |

Unverified: whether Director would return valid JSON on a cold conversation with a novel transcript (not the repeated AMA paste). Do not claim the atomize pipeline is broken in production without a fresh-mind retry.

## Operator protocol (next film)

1. One `npm run dev`. Kill extra Vite. Use the printed **Local:** URL only.
2. **Maximize or F11** Chrome so the recording is 100% product — no wallpaper, no dock.
3. Dismiss Chrome update pills.
4. **Show the cursor:** move slowly, hover 1–2s on every control, then click.
5. **Zoom:** browser 125% for the walk; **Ctrl+=** into status badge, deny banner, Day-2 result; **Ctrl+0** to reset between beats.
6. Unique signup email `film+cloud{unix}@example.com`.
7. Do **not** seed `localStorage` drafts unless the film explicitly labels it as a fallback.
8. Wait for Soul sync / Generate drafts / Improve weakest hook (up to 90s). If Mind returns prose, leave the real error on camera — do not fake cards.
