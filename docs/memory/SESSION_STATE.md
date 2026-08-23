# SESSION STATE — AFTERCUT

## Lock

- **Product:** AFTERCUT  
- **Mode:** **LIVE** hellominds Builder API + **cloud** on Vercel  
- **Deadline:** **2026-08-28 23:59 HKT** (Creative Minds Jam #1) — see [`FACT_CHECK.md`](FACT_CHECK.md)  
- **Production:** https://aftercut-sandy.vercel.app  
- **API:** `api.build.hellominds.ai` · `X-Api-Key`  
- **Keys:** `.env.local` gitignored · Vercel env for prod  
- **Repo:** https://github.com/henrysammarfo/aftercut  
- **Docs:** [`PRODUCTION.md`](../PRODUCTION.md) · [`KEYS_SETUP.md`](../KEYS_SETUP.md) · [`AFTERCUT_BIBLE.md`](../AFTERCUT_BIBLE.md)

## Submit must-haves (official)

1. Working product · Mind **integral**  
2. Persistence / continuity / autonomous follow-up  
3. Creator-economy track (repurposing)  
4. Demo video **1.5–2 min**  
5. Code repo + technical docs  

Apply: https://dorahacks.io/hackathon/creativeminds/detail  

## Live smoke (2026-08-23)

| Check | Result |
|---|---|
| `npm run minds-smoke` | **ok** · Director · cog **1168.61** · mindId `6bf0483e-…df11` |
| Production `/` + `/privacy` | **HTTP 200** |
| Telegram webhook | set → `/api/webhooks/telegram` · bot `8840245437` |
| Neon users | **0** until first signup → TG ingest blocked |
| Film / DoraHacks apply | **open** |

### Shipped this batch (repo + deploy)

- Multi-brand switcher (sidebar)  
- `/reset-password` + Resend status polish  
- Agency invite-by-email (Settings)  
- Merch Gumroad hook (`VITE_GUMROAD_URL`)  
- Zod 4 fix for Better Auth prod 500  

### Ops still open

1. Signup on live → set `TELEGRAM_DEFAULT_USER_ID` + redeploy  
2. Settings: X token · LinkedIn · Connect Google  
3. `RESEND_API_KEY` + `RESEND_FROM` on Vercel  
4. Optional `VITE_GUMROAD_URL`  
5. Demo film → apply  

## Ship ladder

| # | Item | Status |
|---|---|---|
| 1 | minds-smoke green | **done** |
| 2 | Fundraise MVP surface | **in repo** |
| 3 | Cloud + social + calendar + brands | **deployed** |
| 4 | Demo film | **#1 blocker** |
| 5 | DoraHacks apply | after film |

**Moat:** *Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.*

## Not this chat

SCOUT / LOCKIN / FENN → `scoutbot` only. TOOLLAW → other chat.
