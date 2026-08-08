# AFTERCUT

**One sentence:** AFTERCUT is a Minds agent that remembers your creative DNA and keeps turning last night’s long-form into platform-native posts while you sleep.

**Moat:** Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.

Built for [Creative Minds Jam #1](https://creativemindsjam.com) (Hong Kong) — content repurposing track. Mind by Animoca is integral.

Source of truth: [`docs/AFTERCUT_BIBLE.md`](docs/AFTERCUT_BIBLE.md).

## Stack

- Vite + React 19 + TanStack Router / Start
- Tailwind CSS 4
- Local multi-tenant demo auth (localStorage) — swap for Privy / Better Auth later
- Per-user tenant store (brand kit, drafts, timeline, ship ledger, ingests)

## Product surfaces

| Route | Purpose |
|---|---|
| `/` | Marketing — hero, problem, Circle, Day 0–2, publish leash, CTA |
| `/signup` · `/login` | Auth |
| `/dashboard` | Queue health, leash, ledger, memory (auth) |
| `/brand-kit` | Day 0 Soul memory (auth) |
| `/ingest` | Day 1 long-form dump + atomize (auth) |
| `/studio` | Kanban + approve / reject / ship (auth) |
| `/timeline` | Continuity receipts + Day 2 simulate (auth) |
| `/circle` | Mind Circle — Director / HOOKsmith / PLATFORMFIT / QC |
| `/merch` | Cut-mark, palette, hoodie placements (auth) |
| `/pitch` | Demon Mode pitch (public) |

New accounts start **empty** — no seeded drafts or fake testimonials.

## Local development

```sh
npm i
npm run dev
```

Build:

```sh
npm run build
```

## Demo flow (judges)

1. Sign up → empty studio  
2. **Day 0** — save brand kit to Soul  
3. **Day 1** — paste transcript → queue → atomize  
4. Studio — approve / reject behind the publish leash  
5. Try **Post everything now** → `PUBLISH DENIED` banner + Memory receipt  
6. **Simulate Day 2 reopen** — proactive rewrite from *your* kit + ingest  
7. **Circle** — show four Minds and Soul receipts  

Open Campus / Animoca Minds: join community Telegram; awaken AFTERCUT Director on hellominds — Studio is the filmable control surface for the jam video.

Tech: [`docs/TECH.md`](docs/TECH.md) · Bible: [`docs/AFTERCUT_BIBLE.md`](docs/AFTERCUT_BIBLE.md).  

## Brand

- Wordmark: lowercase **aftercut**
- Mark: solid block sliced and offset (see `src/components/brand/Logo.tsx`)
- Type: Geist everywhere; Silkscreen for day/numeral accents
- CTA gradient: `linear-gradient(to bottom, #2B2B2B, #101010)`

## Lovable

This project syncs with [Lovable](https://lovable.dev). Prefer ordinary commits on the connected branch — avoid force-push / history rewrites.

Continue in the [Lovable editor](https://lovable.dev/projects/bb80789a-2513-4065-8d2b-e0407758e9a0) or locally with the commands above.
