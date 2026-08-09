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
| `/timeline` | Continuity receipts + live Day-2 proactive (auth) |
| `/circle` | Mind Circle — Director status (live cognition / Telegram) |
| `/merch` | Cut-mark, palette, hoodie placements (auth) |
| `/pitch` | Demon Mode pitch (public) |

New accounts start **empty** — no seeded drafts or fake testimonials.

## Live Minds (required for jam authenticity)

```sh
cp .env.example .env.local
# MINDS_BUILDER_API_KEY=… from build.hellominds.ai
# MINDS_DIRECTOR_MIND_ID=… optional pin

npx tsx scripts/minds-smoke.ts   # list director + cognition (no secrets printed)
npm run dev
```

Soul sync · atomize · Day-2 proactive · leash notify all hit **api.build.hellominds.ai** via `@animocabrands/minds-client-lib`.

## Local development

```sh
npm i
npm run dev
```

Build:

```sh
npm run build
```

## Demo flow (judges / film)

1. Set `MINDS_BUILDER_API_KEY` in `.env.local` (Builder console)  
2. Sign up → **Brand kit** → **Save + sync Soul** (live Director confirms)  
3. Paste transcript → **Run live atomization** (waits for Mind reply JSON)  
4. Studio — Advance / Approve / Ship · **Post everything now** → DENIED  
5. **Live Day-2 follow-up** → Director rewrites for real  
6. Circle shows live cognition / Telegram flag  

Tech: [`docs/TECH.md`](docs/TECH.md) · Bible: [`docs/AFTERCUT_BIBLE.md`](docs/AFTERCUT_BIBLE.md).

Open Campus / Animoca: awaken AFTERCUT Director + Telegram bot on [hellominds](https://www.hellominds.ai/). Studio is the filmable surface; Mind is integral via Builder API. 

## Brand

- Wordmark: lowercase **aftercut**
- Mark: solid block sliced and offset (see `src/components/brand/Logo.tsx`)
- Type: Geist everywhere; Silkscreen for day/numeral accents
- CTA gradient: `linear-gradient(to bottom, #2B2B2B, #101010)`

## Lovable

This project syncs with [Lovable](https://lovable.dev). Prefer ordinary commits on the connected branch — avoid force-push / history rewrites.

Continue in the [Lovable editor](https://lovable.dev/projects/bb80789a-2513-4065-8d2b-e0407758e9a0) or locally with the commands above.
