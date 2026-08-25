# FACT CHECK — Creative Minds Jam #1 (AFTERCUT)

> Last pass: **2026-08-23**. Unverified claims stay marked.  
> Sources: jam paste · live `npm run minds-smoke` · production HTTP · Animoca announcement URL (fetch may time out — do not invent new deadlines).

## Jam (official paste — treat as source)

| Claim | Status |
|---|---|
| Deadline **28 Aug 2026** (submission) | **Verified** — [Animoca announcement](https://www.animocabrands.com/announcement/the-sandbox-and-animoca-brands-launch-creative-minds-jam-1-hong-kong-usd10000-agentic-ai-competition) timeline: *28 August: Submission deadline*. Time-of-day **23:59 HKT** from jam paste / DoraHacks (Animoca page does not restate HKT clock). |
| Prize pool **$10,000** | Verified (paste + Animoca announcement title) |
| Track prizes $1,200 / $600 · Grand $2,300 · Student $1,300 | Verified (paste) |
| Tracks: growth · **repurposing** · moderation | Verified — AFTERCUT = repurposing |
| Must: working product · Mind integral · persistence · video 1.5–2 min · repo+docs | Verified |
| Single- **or** multi-agent OK | Verified |
| Cognition boost discretionary · one Mind/team | Verified |
| Minds Investment Programme · jam mentions potential ~$250k | Verified (paste). Programme hub also cites up to **US$10M aggregate** — do not invent per-deal amounts |
| Open Campus community partner | Verified (paste) |
| Apply via DoraHacks | Verified — https://dorahacks.io/hackathon/creativeminds/detail |

## Production URL (2026-08-23 live)

| Check | Result |
|---|---|
| https://aftercut-sandy.vercel.app/ | **HTTP 200** |
| https://aftercut-sandy.vercel.app/privacy | **HTTP 200** |
| Neon schema | `db:push` applied (auth + brand + connected_account + publish_event + studio_invite) |
| Cloud mode | Needs `DATABASE_URL` + `BETTER_AUTH_SECRET` (set on Vercel) |

## Minds SDK (`@animocabrands/minds-client-lib@0.1.3`)

| Surface | Used by AFTERCUT |
|---|---|
| listMinds / getMind / cognition | Yes |
| ensureConversation / sendMessage / waitForReply | Yes |
| getLatestHistoryFingerprint | Yes |
| getHistory | Yes — Circle transcript |
| listEquippedSkills / Apps · equipApps | Yes |
| getCognitionUsageByTool | Yes |
| getCircle / listConversations | Yes |
| bazaar.listApps / listSkills | Probe + equip |

## Live Director probe (2026-08-23)

```
ok: true
name: AFTERCUT.Director
mindId: 6bf0483e-f36b-1410-8466-00039ce7df11
isEnabled: true
cognition: 1168.61
telegramBotId: 8840245437 (Minds-linked; BotFather token registered to AFTERCUT webhook)
npm run minds-smoke
```

## Product truth (2026-08-23)

| Item | Truth |
|---|---|
| HOOKsmith / PLATFORMFIT / QC | Director **passes** + Memory receipts (single-agent OK for jam) |
| Cloud auth / Neon / Better Auth | **Live** on Vercel |
| Studio publish X + LinkedIn | **In product** — needs user tokens in Settings |
| Google Calendar | **In product** — Connect Google in Settings |
| Telegram → Studio ingest | Webhook **set** on production URL; **blocked** until signup + `TELEGRAM_DEFAULT_USER_ID` |
| Multi-brand switcher | **Shipped** (sidebar) |
| Agency email invites | **Shipped** (Settings + Resend SDK) |
| Password reset | `/forgot-password` + `/reset-password` — Resend SDK live (smoke id `96cbd50b-…`) |
| Overnight / ship / cognition email | **Live** on Vercel deploy (Resend SDK + env) |
| Merch commerce | Gumroad link hook (`VITE_GUMROAD_URL`) — no Stripe |
| Stripe | **Dropped** for jam |
| Demo film 1.5–2 min | **Open — #1 submit blocker** |
| Image / video ingest | **Live 2026-08-25** — dropzone + poster still; full VOD not stored in tenant JSON |
| First 100 creators waitlist | **Live** — Neon `creator_waitlist` (created on first write if missing) + browser fallback. Not a hard cap of 100. |
| Day 2 persistence demo | **In product** — Simulate Day 2 writes a memory receipt then rewrites the weakest hook |

## Bug found + fix

| Issue | Fix |
|---|---|
| Mind HTML chit-chat in atomize | Parse strips HTML; prompts demand JSON/plain |
| Prod 500 `sessionSchema.loose is not a function` | Zod upgraded to **v4** (Better Auth requires it) |
