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

## Honest harden pass (2026-08-27) — Henry lock-in

| Check | Result |
|---|---|
| Production | https://aftercut-sandy.vercel.app · **READY** `47a3089` (no soft fallbacks) |
| Traffic | Unknown until Vercel Web Analytics enabled |
| Offline fallback | **REMOVED** — Mind → AgentRouter (`claude-opus-5` / `gpt-5.6-sol`) → fail loud |
| Auth gate | `requireAuth` → `assertAuthedServer` + client bridge |
| Mind tenancy | Linked `integrations.mindId` required — **no** shared env Director fallback |
| Telegram | Linked chat id only — **no** `TELEGRAM_DEFAULT_USER_ID` |
| Image gen | Mind brief → AgentRouter Images only — **no** SVG/template substitute |
| Token crypto | `TOKEN_ENCRYPTION_KEY` required — **no** Better Auth secret fallback |
| Auth secret | `BETTER_AUTH_SECRET` required — **no** `dev-only-change-me` |

Creator pain research: [`research-raw/creator-pain-2026-08-27.md`](research-raw/creator-pain-2026-08-27.md)

## DevRel lock (2026-08-27 Discord — Daniel Lin)

| Claim | Action for AFTERCUT |
|---|---|
| Custom **Apps** too late for jam submit | **Don't** build an App |
| Skills = describe to Mind (enough cognition) · no authenticated outbound API in skill | Build **AFTERCUT Cut** Skill — [`research-raw/MINDS_SKILL_AFTERCUT.md`](research-raw/MINDS_SKILL_AFTERCUT.md) |
| Guide: building-skills.md + Minds CLI | https://build.hellominds.ai/agent-md/en/docs/guides/building-skills.md |
| Latest `minds-client-lib` | **0.1.4** live |
| Peer (GreenRoom): `sendMessage` can hang >180s | Keep async UX · AgentRouter live parse path · optional QStash for overnight |
| **Skill built** | **`creator-repurpose`** equipped on AFTERCUT.Director · skillId `F287513E-…DF11` · transcript `research-raw/skill-build/` |

Competitor note: GreenRoom (decision intel) asking same Mind-integral question — our moat stays DNA overnight cuts, not identity-only.

## Live smoke (2026-08-23)

| Check | Result |
|---|---|
| `npm run minds-smoke` | **ok** · Director · cog **1174.54** · mindId `6bf0483e-…df11` |
| `npm test` | **4/4 pass** |
| Production `/` + `/privacy` | **HTTP 200** |
| Vercel prod deploy | **cd2fa56** (Resend SDK) via GitHub |
| Telegram webhook | set → `/api/webhooks/telegram` · bot `8840245437` |
| Neon users | **0** until first signup → TG ingest blocked |
| Film / DoraHacks apply | **shooting now** — Cloud Agent [`bc-55d8923b…`](https://cursor.com/agents/bc-55d8923b-9ad5-4976-aa5e-3d0eece5e8c2) (composer-2.5 · Computer Use + video Artifacts) |

### Shipped this batch (repo + deploy)

- Multi-brand switcher (sidebar)  
- `/reset-password` + Resend status polish  
- Agency invite-by-email (Settings)  
- Merch Gumroad hook (`VITE_GUMROAD_URL`)  
- Zod 4 fix for Better Auth prod 500  
- **Resend official SDK** — welcome · reset · invite · overnight hook · ship receipt · cognition low  

### Ops still open

1. Signup on live → Settings link Mind + Telegram chat id  
2. Settings: X token · LinkedIn · Connect Google  
3. Optional `VITE_GUMROAD_URL`  
4. **Demo film** → Cloud Agent / relaunch — watch **Artifacts** for the mp4. Rotate `CURSOR_API_KEY` (pasted in chat).  
5. Rotate Resend key (was pasted in chat) + verify custom domain for `RESEND_FROM`  

### Shipped this batch (security + brand)

- AFTERCUT **favicon** + **og-image.png** (link previews)  
- **Server-side route guards** (Better Auth cookies + client bridge)  
- **Zod validation** on signup, sign-in, ingest, publish, invites, tokens  
- **AES-256-GCM** encryption for OAuth tokens in `connected_account`  
- Password min **8** chars on signup/sign-in/reset  

### Henry feedback queue (2026-08-25 → shipped)

- **Media ingest** — drop video/image on `/ingest` (still captured; full VOD not stored). Director gets a `[MEDIA ingest]` brief.
- **Toasts** — Sonner toasts for success/info/warn; harsh red banners removed. Publish leash stays visible as **amber**.
- **100-creator beta** — landing + `/pitch` waitlist first; pricing labeled after beta.
- Deeper Minds: visual-dump atomize rule (no invented quotes). Circle equip path unchanged.
- **Day 2 reopen** — filmable persistence beat on Dashboard / Studio / Activity (`Simulate Day 2`).
- **Dump & generate** — one-click queue + atomize. YouTube paste pulls oEmbed title/channel (no invented quotes).
- **Waitlist** — Neon `creator_waitlist` (created on first write) + Resend confirm; browser list is fallback.
- Film / DoraHacks — **film shooting** (agent `bc-55d8923b`). Director JSON-wrapper refusals **fixed** (isolated cut channels + AgentRouter live path) — relaunch film after this SHA is on `main`.
- **Live:** https://aftercut-sandy.vercel.app (187ce7d READY; next SHA this ship)

Portfolio: Scout closed · five product locks named · AFTERCUT polish in progress.

| # | Item | Status |
|---|---|---|
| 1 | minds-smoke green | **done** |
| 2 | Fundraise MVP surface | **in repo** |
| 3 | Cloud + social + calendar + brands | **deployed** |
| 4 | Demo film | **shooting** — [bc-55d8923b](https://cursor.com/agents/bc-55d8923b-9ad5-4976-aa5e-3d0eece5e8c2) |
| 5 | DoraHacks apply | after film |

**Moat:** *Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.*

## Not this chat

SCOUT / LOCKIN / FENN → `scoutbot` only. TOOLLAW → other chat.
