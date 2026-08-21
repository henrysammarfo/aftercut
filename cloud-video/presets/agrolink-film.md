# AgroLink live film (Computer Use + video Artifacts)

**Product:** AgroLink · Team Titan · farm-to-kitchen (Dodowa → Accra)  
**Repo:** https://github.com/henrysammarfo/agrolink @ main  
**Primary demo URL (prefer live — secrets often missing on VM):** https://agrolink-omega.vercel.app  

## Mission

Use **Computer Use** on a real browser. Film a continuous **video Artifact** (mp4-style product demo), not screenshots-only. Also save a few key frame screenshots.

**Pitch truth (do not violate):**
- B2B: Accra **restaurants / chop bars** — not D2C consumers
- Crops: **tomato + leafy greens** on Dodowa–Tema–Accra corridor
- Innovation = **same-day pickup + Paystack MoMo + POD** — feed is discovery only (never “TikTok is the product”)
- Alerts: **in-app + push** only — no SMS/WhatsApp product claims
- No fake testimonials invented for the film

## Setup

1. Prefer **live site** first (fastest, keys already on Vercel): open Chrome/Edge on  
   `https://agrolink-omega.vercel.app`
2. Optional fallback: clone repo, `npm install`, `npm run dev` only if live is down — do **not** block the film waiting on empty local `.env`.
3. Never commit secrets. Do not put API keys in chat notes in the repo.

## Demo accounts (docs/DEMO_REHEARSAL.md)

| Role | Email | Password |
|------|-------|----------|
| Farmer / kitchen demo | `ama-farm@demo.agrolink.app` | `AgroLinkDemo!2026` |
| Admin | `e2e@agrolink.app` | `AgroLinkE2e!2026` |

## Click path (film this order, pause ~1–2s on each beat)

### Act 1 — Marketing / problem (public)
1. Landing hero: corridor badge Dodowa → Accra, MoMo + POD messaging  
2. Scroll: **How it works** steps (Farmer lists → Kitchen discovers → dispatch → MoMo first)  
3. Scroll: **Why not another marketplace** / corridor constraints cards  
4. `/how-it-works` briefly if neat  

### Act 2 — Kitchen (buyer)  
5. `/auth` — sign in as **ama-farm** (demo kitchen/farmer account)  
6. `/app/buyer/feed` — Market **For You** feed (produce discovery). Scroll/swipe one listing if possible  
7. `/app/buyer/cart` — cart / checkout chrome (empty cart OK — show pay-ready path)  
8. `/app/buyer/orders` — orders / track after payment UI  

### Act 3 — Farmer Studio  
9. `/app/farmer` — Seller home (listings count, tomato/greens). Hover listings  
10. `/app/create` — New listing form (photo, price, qty, location). **Do not** submit spam posts unless you can safely abandon; form alone is enough  

### Act 4 — Drive  
11. `/app/transport` — Drive map / go-live workspace  
12. `/app/transport/jobs` — jobs board (paid runs after MoMo)  

### Act 5 — Trust (admin)  
13. Sign out; sign in as **e2e@agrolink.app**  
14. `/app/admin` — overview: drivers KYC / payments / disputes (human overrides)  
15. Optional: click Drivers or Payments if visible  

### Close  
16. Return landing or pause on admin + leave title card in mind:  
    *“AgroLink — same-day tomato & greens, MoMo + POD · Team Titan”*

## Artifacts (required)

1. **Video Artifact** of the full continuous walk (acts 1–5)  
2. Screenshots: landing hero, how-it-works steps, feed (or studio), driver map, admin  

## Report back

- Agent URL  
- What you filmed (beats that worked / skipped)  
- Artifact names for the video  

If login fails, film public marketing pages + auth screen and still produce a video Artifact explaining blocker.
