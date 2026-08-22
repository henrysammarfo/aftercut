# AFTERCUT production ladder

> Target: market-ready SaaS by **Aug 28** — no Stripe, no GitHub Actions.  
> Deploy via Vercel CLI or Lovable sync. Tests run locally: `npm test`.

## Architecture (shipped in repo)

| Layer | Implementation |
|---|---|
| Auth | **Better Auth** — email/password, password reset (Resend), Google OAuth |
| Database | **Neon Postgres** + Drizzle — brands, tenant JSON, OAuth tokens, publish analytics |
| Agent | Live **Minds Builder API** — atomize, proactive, leash |
| Social publish | Real **X API v2** + **LinkedIn UGC** (tokens in Settings) |
| Calendar | **Google Calendar API** via Google OAuth (not a custom calendar) |
| Telegram | Webhook **`/api/webhooks/telegram`** → auto-import |
| Reliability | Retry wrapper, cognition low/critical warnings in shell |
| Tests | **Vitest** — `npm test` (local only, no CI billing) |

## Setup (once)

```bash
# 1. Neon — create project, copy DATABASE_URL
# 2. Vercel — link project, add env vars from .env.example
npm install
npx drizzle-kit push   # creates tables
npm run dev
```

Generate secrets:

```bash
openssl rand -base64 32   # BETTER_AUTH_SECRET
```

## Env checklist

- [ ] `DATABASE_URL` + `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL`
- [ ] `MINDS_BUILDER_API_KEY`
- [ ] `RESEND_API_KEY` (password reset emails)
- [ ] `GOOGLE_CLIENT_ID` / `SECRET` (Calendar + sign-in)
- [ ] `TELEGRAM_WEBHOOK_SECRET` + `TELEGRAM_DEFAULT_USER_ID`
- [ ] `TAVILY_API_KEY` (optional trends)

## Remaining work (7-day sprint)

### P0 — deploy + verify
- [ ] Neon DB live + `drizzle-kit push`
- [ ] Vercel production URL with all env vars
- [ ] Sign up → brand voice → import → generate → studio (cloud path)
- [ ] `npm test` + `npm run minds-smoke`

### P1 — creator expectations
- [x] Connect X + LinkedIn tokens in **Settings** → publish from Studio
- [x] Google Calendar event on scheduled drafts (Calendar API)
- [ ] Telegram webhook registered with BotFather
- [ ] Multi-brand: add brand switcher UI (schema ready)

Full key setup: [`docs/KEYS_SETUP.md`](KEYS_SETUP.md)

### P2 — polish
- [ ] Merch commerce (Shopify Buy Button or Stripe-free Gumroad embed — not custom checkout)
- [ ] Agency seats (invite by email — Better Auth)
- [ ] DoraHacks film (after production URL is stable)

## Explicitly out of scope

- **Stripe / billing** — waitlist + pricing page only
- **GitHub Actions** — use local `npm test` + manual Vercel deploy
- **Custom calendar widget** — Google Calendar API only

## Moat

*Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.*
