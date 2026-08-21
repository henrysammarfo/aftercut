# AXIS finale film (Computer Use + video Artifacts)

**Product:** AXIS — Set. Forget. Earn. AI DeFi portfolio agent  
**Repo:** https://github.com/henrysammarfo/axis @ main  
**Live:** https://axis-mainnet.vercel.app  
**API:** https://axis-api-beta.vercel.app/health  
**Proof (after Google):** https://axis-mainnet.vercel.app/proof  
**Chain:** Arbitrum One 42161  
**Sponsored UserOp (Arbiscan):** https://arbiscan.io/tx/0x96c27132fd04085aaf0443521f105b921083fa8f1a35d06039cfe3ed86fcc3d4

## Mission

Use **Computer Use** on a real browser. Produce a continuous **video Artifact** (mp4-style demo), not screenshots-only. Key screenshots too.

This is a **UXmaxx finale** film for Particle / ZeroDev / Magic / Arbitrum judges. Consumer product, not a crypto dashboard. Pause 1–2s on each beat.

**This film fails if:** there is no video Artifact, or you never show the Google CTA on `/onboard`.

## Pitch truth (do not violate)

- Tagline: **Set. Forget. Earn.**
- Google login → Magic embedded EOA → EIP-7702 Type-4 (same address) → ZeroDev SRA deposits → CallPolicy session key → Aave / LP / GMX
- **Zero transaction signing after login**
- AI explains; it does **not** pick allocations
- Never say “unhackable”
- Do **not** say “we dropped Particle.” Same Google EOA, Type-4 in place, SRA.
- Do **not** try to wire Particle UA SDK or change the 7702 delegate (breaks session keys)

## Google login (try once, then continue)

There is **no demo password**. Login is Magic Google OAuth.

1. `/onboard` → **Continue with Google**
2. If a Google chooser appears and you can complete it without inventing credentials, do it, then film `/proof` (UA address, Type-4 hash, SRA) and `/dashboard` (Apply best route — do **not** spend funds unless a tiny $10 path is obviously already funded).
3. If OAuth / captcha / 2FA blocks you: **do not invent accounts**. Screenshot the Google button, say “login is Magic Google,” and continue the public path below. Still produce the video.

## Click path

### Act 1 — Landing (20s)
1. Hard-refresh https://axis-mainnet.vercel.app (Ctrl+Shift+R)
2. Hold the hero. Consumer copy, not jargon.
3. Move toward Get started / onboard.

### Act 2 — Google CTA (25s)
4. https://axis-mainnet.vercel.app/onboard
5. Hold **Continue with Google**. “No seed phrase, no MetaMask.”
6. Click it once. If blocked, go to Act 3.

### Act 3 — If logged in (60s) — skip if blocked
7. `/proof` — point at UA address, Type-4 tx, SRA, green checks
8. `/dashboard` — risk/goal/budget, Smart route. Hover **Apply best route**. Do not drain a wallet. If a position + Arbiscan link already exists, show it.

### Act 4 — Public product (45s)
9. `/manifesto` (2s)
10. `/vault` (vaults / yields)
11. `/agent` (agent story)
12. `/merch` (brand, 2s)
13. New tab: https://axis-api-beta.vercel.app/health — `"status":"ok"`, fully_configured
14. New tab: Arbiscan sponsored UserOp hash above — real gasless tx

### Act 5 — Close (15s)
15. Back to landing. Hold hero.
16. End card energy: *“AXIS — Set. Forget. Earn. · axis-mainnet.vercel.app”*

## Artifacts (required)

1. **Video Artifact** of acts 1–5 (or 1–2 + 4–5 if login blocked)
2. Screenshots: landing, onboard Google button, health JSON, Arbiscan tx, and `/proof` if logged in

## Report back

- Agent URL
- Google login completed? (yes/no + blocker)
- `/proof` greens filmed? (yes/no)
- Video Artifact file name
- Beats filmed / skipped
