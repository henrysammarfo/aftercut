# OPAL dashboard film v2 (Computer Use + video Artifacts)

**Product:** OPAL · tryopal · pre-claim risk intelligence for SEA SMEs (Zurich GFH 2026 Problem 3)  
**Repo:** https://github.com/henrysammarfo/tryopal @ main (prod deploy **ebd732c**, 2026-08-12)  
**Live site:** https://tryopal.asia  

## Mission

Film the **live invite-only dashboard** end-to-end on production — not marketing pages.  
Use **Computer Use** on a real browser. Produce a continuous **video Artifact** (mp4-style demo). Key screenshots too.

**This film fails if:**
- You never reach `/dashboard` with score gauge + 3 gap cards, OR
- You click a gap but stay on the list (URL changes to `/gaps/cyber-1` but content stays “Three exposures”) — that was the old bug; **fixed in prod** — you must show the **gap detail page** (drivers, exposure in SGD, Talk to advisor).

## Demo login (required)

| Field | Value |
|-------|--------|
| URL | https://tryopal.asia/auth |
| Email | `film-demo@tryopal.asia` |
| Password | `OpalFilm!2026` |

VM env `OPAL_FILM_EMAIL` / `OPAL_FILM_PASSWORD` if set — same values.

Seat is allowlisted. Expect **Opal Score ~50**, benchmark ~58, **3 gap cards in SGD**.

## Pitch truth (do not violate)

- Tagline: **See the gap before the claim**
- 12 inputs → **OPAL Score 0–100** → **exactly 3 coverage gaps in SGD** → Zurich-aligned product themes (guidance, not binding quote)
- Dashboard is **invite-only** (seeded film seat — not public signup)
- Stats if spoken: SingStat ~369,500 SG SMEs; UNDP <5% ASEAN MSMEs insured; CSA phishing +49% / ransomware +21%
- Never “70% underinsured”. Not a broker / claims app / marketplace.
- **Do not** film Team invites or Stripe checkout (intentionally off for pilot).

## Setup

1. Hard-refresh https://tryopal.asia (Ctrl+Shift+R) so you get the latest deploy.
2. Go to `/auth`, sign in, land on `/dashboard`.
3. If login fails: retry once; report error. Do **not** substitute marketing-only film.

## Click path (pause 1–2s on each beat)

### Act 1 — Sign in (10s)
1. `/auth` → email + password → Sign in  
2. Confirm **`/dashboard`** with gauge + 3 cards

### Act 2 — Dashboard hero (35s)
3. Overview: score gauge, benchmark line, **three gap cards** (SGD exposure)  
4. **Click first gap card** → must navigate to **`/gaps/<id>` detail** (title, drivers list, exposure) — not modal-only  
5. Breadcrumb: Dashboard / Gaps / Gap detail  
6. Back to dashboard; point at **Export PDF** (goes to `/report` or print — show print dialog briefly if fast)  
7. Optional: header search type **“cyber”** → pick a gap from dropdown → land on detail again  

### Act 3 — Score + gaps list
8. Sidebar → **Score** — five pillars  
9. Sidebar → **Gaps** — list of three priced gaps  
10. Click one row → **same gap detail page** (drivers + matched product block)  
11. **Do not** submit Talk to advisor (avoid spam) — hover the button is enough  

### Act 4 — Products + monitoring
12. **Products** — Zurich-aligned matches  
13. **Monitoring** — pilot status + history (do not run update unless you have time)  
14. Quick pass: **Notifications** (empty nudge ok), **Settings** (2s)  

### Act 5 — Close
15. Return `/dashboard` — hold gauge + 3 cards  
16. End card: *“OPAL — See the gap before the claim · tryopal.asia”*

## Optional (max 8s total, after dashboard)

Home hero only if time — then back to app. No waitlist/book focus.

## Artifacts (required)

1. **Video Artifact** — full acts 1–5  
2. Screenshots: dashboard, **gap detail page** (proves routing fix), score pillars, products  

## Report back

- Agent URL  
- `/dashboard` loaded with score + 3 cards? (yes/no)  
- Gap detail page rendered (not stuck on list)? (yes/no)  
- Beats filmed / skipped  
- Artifact file names  
