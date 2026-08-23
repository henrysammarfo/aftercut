# AFTERCUT jam film — seamless Computer Use product demo

Repo: `henrysammarfo/aftercut` @ `main`.  
Target length: **90–120 seconds** of continuous **video Artifact** (not screenshot slideshow).  
Official beat sheet: `docs/FILM_DEMO.md`.

---

## Mission

Film a **judge-ready product demo** of AFTERCUT live on the desktop browser. Viewers must clearly see the full UI, every click, and each beat from the MD. Treat this like a founder screen-share pitch — calm, continuous, readable.

---

## Video / Computer Use craft (MANDATORY)

1. **Full desktop frame** — maximize the browser window before recording. Prefer viewport **1920×1080** or **1440×900**. The app UI must fill the frame; **no tiny window in the corner**.
2. **No frantic zoom** — do **not** pinch-zoom, Ctrl+/- spam, or crop to random UI crumbs. If something is small, scroll once so the target is centered, then click. Keep the same zoom (~100%) the entire film.
3. **One continuous take** — start the video Artifact **after** `npm run dev` is up and the landing page is loaded. Keep recording through the full walk without stopping/restarting the capture mid-demo.
4. **Pace for humans** — pause **1.5–2s** after each major screen loads so text/cards are readable. Move the cursor deliberately; click once; wait for navigation.
5. **Cursor visibility** — move slowly to each control so judges can follow. Hover briefly before clicking primary CTAs.
6. **No secrets on camera** — never open `.env`, never type API keys into the UI, never show the terminal with secrets. Minds keys stay in `.env.local` only.
7. **Artifact required** — deliver a continuous **video** in Artifacts. Screenshots of each beat are optional extras, not a substitute for the video.

---

## Setup (before camera starts)

1. Write gitignored `.env.local` from injected `MINDS_BUILDER_API_KEY` and `MINDS_DIRECTOR_MIND_ID` (do not print keys).
2. `npm install`
3. `npx tsx scripts/minds-smoke.ts` → must show `ok: true`, Director enabled.
4. `npm run dev` — wait until Local URL is ready.
5. Open Chromium/Chrome **maximized** to that URL (usually `http://localhost:5173`).
6. Confirm landing hero + “aftercut” wordmark are fully visible, then **start the video Artifact**.

---

## Shot list (follow `docs/FILM_DEMO.md` exactly)

Use a unique signup: email `film+cloud{timestamp}@example.com` · password `FilmDemo!2026`

| Time | Path | Action on screen |
|---|---|---|
| 0:00 | `/` | Hold on landing 2s. Show hero: “Ship cuts that grind while you rest”. |
| 0:12 | Sign up | Click **Get started** / **Sign up**. Fill name `Northline`, email, password. Submit. |
| 0:28 | `/brand-kit` or onboarding → brand | Set brand **Northline Studio**. Tone: calm, sharp founder. Ban phrases: overnight riches, set and forget spam, guaranteed virality. **Save** + **sync Soul** if button present. Wait until success/status updates. |
| 0:48 | `/ingest` | Paste the long-form below. Queue / add. Click **Live atomize** (or generate drafts). Wait until Studio drafts appear. |
| 1:05 | `/studio` | Show kanban cards. Advance one card stage if needed. Scroll so cards fill the frame. |
| 1:18 | Studio | Click **Post everything now** (or bulk publish). Show **PUBLISH DENIED** / leash messaging clearly. Pause 2s on the deny state. |
| 1:30 | Studio | Click **Live Day-2 follow-up** / proactive rewrite. Wait for improved hook in Needs approval. |
| 1:42 | `/timeline` | Open Activity; show receipts. |
| 1:50 | `/circle` | Open Agent team; show Director / cognition if visible. Hold 2s. End. |

If a button label differs slightly, choose the closest primary action that matches the beat — do not invent features.

---

## Long-form paste (ingest)

```
Last week we closed a 90-minute founder AMA on shipping multi-surface content without losing brand DNA. Three takeaways: (1) native hooks beat identical cross-posts; (2) human approve gate; (3) overnight follow-up with memory wins. Shorts under 90 chars; X one claim; LinkedIn lessons; newsletter subject as preview. Never promise guaranteed virality. CTA: reply with your long-form.
```

---

## Done criteria

- [ ] Continuous video Artifact ~90–120s
- [ ] Full-screen browser; readable UI the whole time
- [ ] All FILM_DEMO beats landed: landing → signup → brand/soul → ingest/atomize → studio → publish denied → Day-2 → timeline → circle
- [ ] minds-smoke was green before filming
- [ ] No secrets committed; no keys in PR text

Report the Artifacts video URL/path when finished.
