# AFTERCUT production ladder

> Target: market-ready SaaS by **Aug 28** — no Stripe, no GitHub Actions.  
> Live: https://aftercut-sandy.vercel.app · Tests: `npm test`.

## Architecture (shipped)

| Layer | Implementation |
|---|---|
| Auth | **Better Auth** — email/password, `/forgot-password` + `/reset-password` (Resend), Google OAuth |
| Database | **Neon Postgres** + Drizzle — brands, tenant JSON, OAuth tokens, invites, publish analytics |
| Multi-brand | Sidebar switcher + create brand (cloud) |
| Agency seats | Settings invite-by-email (`studio_invite`) |
| Agent | Live **Minds Builder API** |
| Social publish | **X API v2** + **LinkedIn UGC** |
| Calendar | **Google Calendar API** |
| Telegram | Webhook `/api/webhooks/telegram` |
| Merch | Gumroad link via `VITE_GUMROAD_URL` |
| Tests | Vitest — `npm test` |

## Env checklist

- [x] `DATABASE_URL` + `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL`
- [x] `MINDS_BUILDER_API_KEY`
- [ ] `RESEND_API_KEY` + `RESEND_FROM` (password reset + invites)
- [x] `GOOGLE_CLIENT_ID` / `SECRET`
- [x] `TELEGRAM_WEBHOOK_SECRET` (webhook set)
- [ ] `TELEGRAM_DEFAULT_USER_ID` (after first signup)
- [ ] `VITE_GUMROAD_URL` (optional merch)
- [ ] `TAVILY_API_KEY` (optional)

## Remaining

### P0 — you / ops
- [ ] Sign up on live → set `TELEGRAM_DEFAULT_USER_ID` → redeploy
- [ ] Paste X (+ LinkedIn) tokens in Settings; Connect Google
- [ ] Add Resend keys for real reset/invite email
- [ ] Smoke: import → generate → publish / calendar

### P1 — done in repo
- [x] Studio publish + Google Calendar
- [x] Telegram webhook registered
- [x] Multi-brand switcher UI
- [x] Resend polish + reset-password page
- [x] Agency invite-by-email
- [x] Merch Gumroad hook

### P2
- [ ] DoraHacks film
- [ ] Secret rotation after jam

## Explicitly out of scope

- **Stripe / billing** — waitlist + pricing only
- **GitHub Actions** — local `npm test` + Vercel CLI

## Moat

*Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.*
