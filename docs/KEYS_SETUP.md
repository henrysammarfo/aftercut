# AFTERCUT — API keys setup (Aug 2026)

Accurate steps for every integration AFTERCUT uses. No Stripe. No GitHub Actions.

---

## 0. Core production (required for cloud mode)

### Neon Postgres (`DATABASE_URL`)

1. Go to [https://neon.tech](https://neon.tech) → create project (free tier works).
2. Dashboard → **Connection details** → copy **Pooled connection** string (`postgresql://…?sslmode=require`).
3. Set as `DATABASE_URL` on Vercel and in local `.env.local`.
4. From repo root: `npm run db:push` (creates Better Auth + brand + analytics tables).

### Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)

1. Generate secret: `openssl rand -base64 32`
2. Set `BETTER_AUTH_SECRET` to that value.
3. Set `BETTER_AUTH_URL` to your public app URL, e.g. `https://aftercut-sandy.vercel.app` (no trailing slash).
4. Add the same URL to Vercel **Environment Variables** for Production + Preview.

**Live production (2026-08-23):** https://aftercut-sandy.vercel.app  

Cloud mode activates when **both** `DATABASE_URL` and `BETTER_AUTH_SECRET` are set.

### Minds Builder API (`MINDS_BUILDER_API_KEY`, optional `MINDS_DIRECTOR_MIND_ID`)

1. Sign in at [https://build.hellominds.ai](https://build.hellominds.ai)
2. **Builder console** → create / copy **API key** → `MINDS_BUILDER_API_KEY`
3. Awaken **AFTERCUT Director** on [https://www.hellominds.ai](https://www.hellominds.ai)
4. Optional: `minds list` or smoke script → pin UUID as `MINDS_DIRECTOR_MIND_ID`
5. Verify: `npm run minds-smoke`

### Resend — transactional email (`RESEND_API_KEY`, `RESEND_FROM`)

Official **`resend` Node SDK** (`src/lib/email.ts`). Paths:

| Email | Trigger |
|---|---|
| Password reset | Better Auth `sendResetPassword` |
| Welcome | `databaseHooks.user.create.after` |
| Studio invite | Settings → Agency seats |
| Overnight hook | Cloud proactive rewrite (Needs approval) |
| Ship receipt | X / LinkedIn / Google Calendar success |
| Cognition low | AppShell when credits critical (once/day) |

1. [https://resend.com](https://resend.com) → **API Keys** → create key → `RESEND_API_KEY`
2. Verify a domain, or use `RESEND_FROM=AFTERCUT <onboarding@resend.dev>` for testing
3. Without Resend, reset links print to server logs (dev only)
4. **Rotate** any key pasted in chat before going fully public

### AgentRouter — live LLM + images (`AGENT_ROUTER_API_KEY`)

One key → Claude / GPT / DeepSeek credits (model switch). No separate OpenAI/Anthropic keys.

1. [https://agentrouter.org/console/token](https://agentrouter.org/console/token) → `AGENT_ROUTER_API_KEY`
2. Base: `https://agentrouter.org` (Anthropic Messages + Claude Code wire headers)
3. Live model IDs on this account: `claude-opus-5`, `claude-opus-4-8`, `gpt-5.6-sol`, `deepseek-v4-flash`, `glm-5.3`
4. Optional: `AGENT_ROUTER_ANTHROPIC_MODEL=claude-opus-5` · `AGENT_ROUTER_OPENAI_MODEL=gpt-5.6-sol`
5. Used for: cut/Day-2 second path when Mind JSON fails · Studio still render after Mind brief
6. **Mind is primary** — AgentRouter is the gateway helper, not a native-key replacement ask

### TinyFish — research scrape (`TINYFISH_API_KEY`)

1. Agent dashboard → API key → `TINYFISH_API_KEY`
2. Used for creator-pain / jam research scripts (with Tavily)

### Tavily — trend context (`TAVILY_API_KEY`)

1. [https://tavily.com](https://tavily.com) → sign up → copy API key
2. Injected into atomize when present.

---

## 1. Google — Sign-in + Calendar (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

Used for: **Sign in with Google** (Better Auth) + **Google Calendar API** event insert.

1. [Google Cloud Console](https://console.cloud.google.com/) → create project **AFTERCUT**
2. **APIs & Services → Library** → enable:
   - **Google Calendar API**
   - (OAuth consent already covers profile/email via Better Auth)
3. **APIs & Services → OAuth consent screen**
   - User type: External (or Internal if Workspace)
   - Add scopes: `email`, `profile`, `openid`, `https://www.googleapis.com/auth/calendar.events`
4. **APIs & Services → Credentials → Create OAuth client ID**
   - Type: **Web application**
   - **Authorized redirect URIs** (exact match):
     - `https://YOUR-DOMAIN/api/auth/callback/google`
     - `http://localhost:5173/api/auth/callback/google` (local dev)
5. Copy **Client ID** → `GOOGLE_CLIENT_ID`, **Client secret** → `GOOGLE_CLIENT_SECRET`
6. In AFTERCUT: **Settings → Connect Google** (stores token for Calendar)

**Studio:** Scheduled drafts → **Add to Google Calendar** uses `POST https://www.googleapis.com/calendar/v3/calendars/primary/events`

---

## 2. X (Twitter) — publish (`Settings → paste token`)

AFTERCUT calls **`POST https://api.x.com/2/tweets`** with a **user access token** (OAuth 2.0 user context).

1. [X Developer Portal](https://developer.x.com/en/portal/dashboard) → apply / sign in
2. Create a **Project** and **App** (Free tier can post with limits — check current portal tiers)
3. App → **User authentication settings** → set up **OAuth 2.0**
   - Type: **Web App** (or conf. client for PKCE flow)
   - Callback URL: your app or `http://localhost:5173/settings` for manual token grab
   - Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access` (refresh)
4. Run OAuth 2.0 PKCE flow once to get a **user access token** with `tweet.write`
   - Or use OAuth 1.0a user tokens with Read+Write app permission (regenerate tokens after permission change)
5. In AFTERCUT **Settings → X access token** → paste token → Save

**Note:** App must have **Read and Write** permission. After changing permissions, regenerate user tokens.

---

## 3. LinkedIn — publish (`Settings → paste token`)

AFTERCUT uses **UGC Posts API** (`POST https://api.linkedin.com/v2/ugcPosts`) with scope **`w_member_social`**.

1. [LinkedIn Developers](https://www.linkedin.com/developers/apps) → **Create app**
   - Requires a LinkedIn **Company Page** linked to the app (instant self-verify as page admin)
2. **Products** tab → add **Share on LinkedIn** (self-serve, usually instant)
   - Also add **Sign In with LinkedIn using OpenID Connect** if using OpenID userinfo
3. **Auth** tab → **OAuth 2.0 settings**
   - Add redirect URL, e.g. `http://localhost:5173/settings` or your production callback
   - Confirm scopes include: `openid`, `profile`, `email`, `w_member_social`
4. Copy **Client ID** and **Client Secret**
5. Open in browser (replace values):

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=openid%20profile%20email%20w_member_social
```

6. After approve, exchange `code` for access token:

```bash
curl -X POST "https://www.linkedin.com/oauth/v2/accessToken" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=YOUR_REDIRECT_URI&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

7. Paste `access_token` in AFTERCUT **Settings → LinkedIn access token**

Token lifetime ~60 days — repeat OAuth when expired.

---

## 4. Telegram — auto-import webhook

Per-user: Settings → paste Telegram chat id. Webhook routes by linked chat (and `connected_account`).

1. Create bot via [@BotFather](https://t.me/BotFather) → `/newbot` → copy token → `TELEGRAM_BOT_TOKEN`
2. Link bot to your Mind on hellominds.ai (optional; Circle shows Telegram flag)
3. Set env on Vercel:
   - `TELEGRAM_BOT_TOKEN` — BotFather token
   - `TELEGRAM_WEBHOOK_SECRET` — random string you choose
   - `TOKEN_ENCRYPTION_KEY` — random 32-byte base64 (OAuth token AES; else falls back to `BETTER_AUTH_SECRET`)
   - Optional jam fallback: `TELEGRAM_DEFAULT_USER_ID` = your `user.id` after first signup (Settings shows it)
4. Register webhook (replace values):

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://YOUR-DOMAIN/api/webhooks/telegram" \
  -d "secret_token=YOUR_TELEGRAM_WEBHOOK_SECRET"
```

Messages ≥48 characters from users messaging the bot are imported for that studio user.

---

## 5. Vercel deploy (no GitHub Actions)

```bash
npm i -g vercel
vercel link
vercel env pull .env.local   # optional
# Add all vars in Vercel dashboard → Settings → Environment Variables
vercel --prod
```

Or push to `main` via Lovable sync if connected.

---

## Quick env reference

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Production | Neon Postgres |
| `BETTER_AUTH_SECRET` | Production | Session signing |
| `BETTER_AUTH_URL` | Production | OAuth callbacks |
| `MINDS_BUILDER_API_KEY` | Yes | Agent atomize/proactive |
| `MINDS_DIRECTOR_MIND_ID` | Optional | Pin Director |
| `RESEND_API_KEY` | Recommended | Reset · welcome · invite · overnight · ship · cognition |
| `TOKEN_ENCRYPTION_KEY` | **Prod+Preview set** | AES for OAuth tokens (scrypt); else `BETTER_AUTH_SECRET` |
| `TELEGRAM_BOT_TOKEN` | **Prod+Preview set** | BotFather token |
| `TELEGRAM_DEFAULT_USER_ID` | Optional jam fallback | Only if chat id not linked yet — set after first signup (Settings shows user id) |
| `CURSOR_API_KEY` | Film only | Cloud Agent demo video — `npm run cloud:film` |
| `GOOGLE_CLIENT_ID/SECRET` | For Calendar | Google OAuth |
| `TAVILY_API_KEY` | Optional | Trend context |
| `TELEGRAM_WEBHOOK_SECRET` | For TG import | Webhook auth |
| `TELEGRAM_DEFAULT_USER_ID` | For TG import | Map bot → user |

---

## Verify end-to-end

```bash
npm run db:push
npm run minds-smoke
npm test
npm run build
```

Then in production: Sign up → Brand voice → Import → Generate → Studio → Approve → Schedule → **Publish to X/LinkedIn** or **Add to Google Calendar**.
