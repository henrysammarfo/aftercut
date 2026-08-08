# TECH — AFTERCUT

> Creative Minds Jam #1 · content repurposing · Mind by Animoca **integral** (ops + film).  
> Product build mode now: **production offline Studio** — no live hellominds / Telegram / OpenAI.  
> Deadline **2026-08-28 23:59 HKT**. Ask before git push / Vercel.

## Product truth (do not oversell)

| Layer | Status |
|---|---|
| Offline Studio (auth, kit, ingest, atomize, kanban, leash, Day 2, export) | **Built** — browser `localStorage` tenant v2 |
| Hellominds / Telegram / OpenAI bridge | **Not in this build** — out-of-band jam ops |
| Vercel production deploy | **Not claimed** until explicitly shipped |

## Product surface

| Route | Layer |
|---|---|
| `/` | Marketing — 8s object, Circle, Day 0–2, publish leash |
| `/signup` · `/login` | Multi-tenant auth (localStorage) |
| `/dashboard` | Queue · leash · ledger · memory · **export/import JSON** |
| `/brand-kit` | Day 0 Soul (validated name + tone) |
| `/ingest` | Day 1 long-form queue + offline atomize |
| `/studio` | Kanban · approve/reject · ship QC · **Post everything → DENIED** |
| `/timeline` | Continuity receipts · Simulate Day 2 |
| `/circle` | Mind roles + receipt counts (offline labels) |
| `/pitch` | Demon Mode judging beats |
| `/merch` | Brand mark placements |

## Architecture (offline)

```
Creator (UI)
  → Brand kit → Soul (aftercut_tenant_v2_{userId})
  → Ingest text (>=48 chars) → atomize.ts (splitBeats, platform limits, do-not-say, CTAs)
  → Circle agent meta on each draft
  → Approve gate → scheduled → ship (QC near-dupe on ledger)
  → denyPublishAll always logs PUBLISH DENIED
  → Day 2: proactiveRewriteHook from kit
  → exportTenantJson / importTenantJson
```

- **Tenant key:** `aftercut_tenant_v2_{userId}` (migrates once from `aftercut_tenant_{userId}`).
- **No seeded P&L / fake drafts** on signup.
- **Mode flag:** `productMode: "offline"` on auth + shell badge.

## Core modules

| File | Job |
|---|---|
| `src/lib/atomize.ts` | Pure offline atomizer |
| `src/lib/tenant-store.ts` | Typed ops + persistence + ship rules |
| `src/lib/auth.tsx` | Session + Result-typed Studio ops |

## Minds integral (film path)

1. **Day 0** — save kit → “Soul awakened”  
2. **Day 1** — dump → atomize → Studio cards  
3. **Leash** — “Post everything now” → **PUBLISH DENIED**  
4. **Day 2** — Simulate reopen → proactive rewrite  

Live hellominds is separate jam ops, not this codebase path.

## Stack

- Vite + React 19 + TanStack Router / Start  
- Tailwind CSS 4  
- Host when ready: **Vercel** (UI only). No Railway.

## Local

```sh
npm i
npm run dev
npm run build
```

## Submit pack (still open)

- Working product (offline Studio = filmable)  
- 1.5–2 min Day0 / Day1 / Day2 video  
- TECH.md + bible  
- DoraHacks BUIDL by deadline  
- Mind account note in README when live  
