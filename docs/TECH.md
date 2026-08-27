# TECH — AFTERCUT (live Mind path)

> Creative Minds Jam #1 · deadline **2026-08-28** (Animoca press).  
> **Live mode:** Animoca Builder API `@animocabrands/minds-client-lib` → `api.build.hellominds.ai`.

## Product truth

| Layer | Status |
|---|---|
| Live Director (list, cognition, telegram flag) | **Wired** — polls Builder API |
| Soul sync (kit → Mind message) | **Wired** — `syncSoulLive` + waitForReply |
| Live atomize | **Wired** — Mind returns JSON drafts |
| Circle passes (HOOK / PLATFORM / QC) | **Wired** — receipts on Memory timeline |
| getHistory transcript | **Wired** — `/circle` live transcript |
| Equipped skills / apps / usage-by-tool | **Wired** — status + equip creator stack |
| Tavily trends into atomize | **Wired** — when `TAVILY_API_KEY` present |
| Live Day-2 proactive | **Wired** — Mind rewrite, no local simulate |
| Publish leash | **Wired** — local deny + notify Mind |
| Guided `/onboarding` | **Wired** — kit → atomize → leash → Day-2 |
| Studio copy-pack | **Wired** — clipboard + download for CapCut |
| Studio tenant (kanban, export) | Browser ledger of **live** outputs |
| Telegram bot messages into Studio | Bot linked on Director (`telegramBotId`) — paste dump until webhook |

Fact check: [`docs/memory/FACT_CHECK.md`](memory/FACT_CHECK.md).  
Honest fundraise scope: [`docs/MVP_FREEZE.md`](MVP_FREEZE.md).

## Env (server only)

```
MINDS_BUILDER_API_KEY=   # X-Api-Key · required
MINDS_DIRECTOR_MIND_ID=  # smoke scripts only — product uses Settings-linked Mind
TAVILY_API_KEY=          # optional · trends into atomize
```

Copy `.env.example` → `.env.local` (gitignored).  
Or place the same vars in `scoutbot/agent/.env` (server reads as fallback for local dev).

## Ops scripts

```sh
npm run minds-smoke   # director + cognition
npm run minds-probe   # full Builder surface probe
npm run minds-equip   # VoiceTranscribe + YouTube Research Scout
```

## Modules

| File | Role |
|---|---|
| `src/lib/minds/runtime.ts` | Client, talkToDirector, key load |
| `src/lib/minds/live.ts` | createServerFn endpoints |
| `src/lib/minds/parse.ts` | Mind JSON → drafts |
| `src/lib/minds/prompts.ts` | Soul / atomize / proactive prompts |
| `src/lib/auth.tsx` | Live async kit/atomize/proactive |

## Setup ops

1. hellominds.ai — awaken **AFTERCUT Director**  
2. Builder key → `.env.local`  
3. Optional: Telegram Link Bot (platform UI)  
4. `npm run dev` → Badge shows **live · Director · cog N**  
5. Brand kit **Save + sync Soul** must succeed before atomize  

## No longer product path

- "Simulate Day 2" local rewrite — removed  
- Offline-only atomizer as product — local `atomize.ts` remains pure helpers only; tenant path uses live Mind for generation  

## Local

```sh
npm i
# set MINDS_BUILDER_API_KEY in .env.local
npx tsx scripts/minds-smoke.ts
npm run minds-smoke
npm run dev
npm run build
```
