# Magmos live film (Computer Use + video Artifacts)

**Product:** Magmos · USDC earning dollar on Base (beta)  
**Repo shell (Cloud Agent):** https://github.com/henrysammarfo/aftercut @ main  
*(Magmoslabs/magmoslabs is private — agent may fail branch verify; film the live site instead.)*  
**Primary demo URL:** https://magmoslabs.vercel.app  

## Mission

Use **Computer Use** on a real browser. Film Magmos at the live URL — **do not build or demo aftercut**. Continuous **video Artifact** (mp4-style), **not screenshots-only**. Also save a few key frame screenshots.

**Pitch truth (do not violate):**
- Consumer wallet app: **mUSD** = Magmos dollar; earn / pay / save
- Live chain = **Base Sepolia** preview (test funds only — say “beta / preview,” not mainnet money)
- App is **invite-only**; marketing site is public
- Nav labels (post P2.13): **Wallet · Savings · Pay · Get started · Admin · Account**
- Do **not** invent APR claims, “unhackable,” or mainnet readiness
- Prefer **consumer UI** language (earnings, payments) — skip raw contract jargon on camera

## Setup

1. Prefer **live site** first: open Chrome on `https://magmoslabs.vercel.app`
2. Optional fallback: clone Magmoslabs/magmoslabs, `npm install`, `npm run dev` only if live is down
3. Never commit secrets. Do not paste invite codes or private keys into the repo
4. If invite gate blocks: film **public landing** fully, then auth/invite screens, still produce a **video Artifact** and note the blocker

## Invite / wallet (if available in env)

- **Preferred (P2.14+):** If `MAGMOS_FILM_URL` is set, open that URL first — bypasses Privy + invite gate:
  - Shape: `https://magmoslabs.vercel.app/dashboard?magmosFilm=<token>`
  - **UI tour only** — preview banner shows; transactions are disabled
  - Do not invent the token; use the env value only
- Fallback: invite code via env if provided; wallet connect if preview URL unavailable
- If both fail: film **public landing** + gate screens; still ship video Artifact

## Click path (film this order, pause ~1–2s on each beat)

### Act 1 — Marketing (public) — keep landing look intact
1. Landing **hero**: Magmos brand dominant, Open app CTA  
2. Scroll briefly through marketing sections (do not dig into docs jargon)  
3. Bottom CTA band: **Open app** / **Get started**  

### Act 2 — Preview session (skip Privy when MAGMOS_FILM_URL set)
4. Open `MAGMOS_FILM_URL` **or** click **Open app** → sign-in / invite (fallback only)  
5. Confirm violet **Preview mode — UI tour only** banner on Wallet  
6. If no preview URL and invite gate: pause on gate UI; do not guess codes  

### Act 3 — Wallet (new consumer UX — hero of the film)
7. `/dashboard` — title **Wallet**; show **Add mUSD**, **Withdraw to USDC**, **Turn on earnings** (do not submit)  
8. Balance cards: Cash available / mUSD / Earnings On·Off / Rewards earned  
9. Scroll **Activity** feed (deposits, rewards, payments labels — not “epoch”)  

### Act 4 — Get started checklist
10. `/campaign` — **Get started** / Setup checklist (6 steps)  
11. Show progress / “You're all set” if complete; otherwise partial progress  

### Act 5 — Pay + Savings
12. `/agents` — **Pay**: set up / send with limits (do not spam real spends)  
13. `/stake` — **Savings**: Move to Savings / Withdraw all chrome  

### Act 6 — Admin (optional, brief)
14. `/keeper` — **Admin**: reward pool / send payouts framing (operator-only; skip if locked)  

### Close
15. Return to Wallet or landing; mental title card:  
    *“Magmos — earning dollar wallet · beta · magmoslabs.vercel.app”*

## Artifacts (required)

1. **Video Artifact** of the continuous walk (acts 1–6 as far as access allows)  
2. Screenshots: landing hero, Wallet (new UX), Get started checklist, Pay or Savings  

## Report back

- Agent URL (`https://cursor.com/agents/bc-…`)  
- Beats filmed / skipped  
- Artifact names for the video  

If wallet/invite fails, still ship a video of public marketing + gates + any reachable app chrome.
