# FACT CHECK — Creative Minds Jam #1 (AFTERCUT)

> Verified against official paste + live Builder API probe **2026-08-22**.  
> Unverified claims stay marked.

## Jam (official paste — treat as source)

| Claim | Status |
|---|---|
| Deadline **28 Aug 2026, 23:59 HKT** | Verified (user paste + creativemindsjam timeline) |
| Prize pool **$10,000** | Verified (paste) |
| Track prizes $1,200 / $600 · Grand $2,300 · Student $1,300 | Verified (paste) |
| Tracks: growth · **repurposing** · moderation | Verified — AFTERCUT = repurposing |
| Must: working product · Mind integral · persistence · video 1.5–2 min · repo+docs | Verified |
| Single- **or** multi-agent OK | Verified |
| Cognition boost discretionary · one Mind/team | Verified |
| Minds Investment Programme · jam mentions potential ~$250k | Verified (paste). Programme hub also cites up to **US$10M aggregate** allocation — do not invent per-deal amounts |
| Open Campus community partner | Verified (paste) |
| Apply via DoraHacks / Apply Now | Verified (paste + dorahacks link in SESSION_STATE) |

## Minds SDK (`@animocabrands/minds-client-lib@0.1.3` — latest as of probe)

| Surface | Used by AFTERCUT |
|---|---|
| listMinds / getMind / cognition balance | Yes |
| ensureConversation / sendMessage / waitForReply | Yes (Soul · atomize · proactive · leash) |
| getLatestHistoryFingerprint | Yes |
| **getHistory** | **Yes (new)** — Circle transcript |
| **listEquippedSkills / Apps · equipApps** | **Yes (new)** — Circle + creator stack |
| **getCognitionUsageByTool** | **Yes (new)** — Circle tools strip |
| **getCircle / listConversations** | **Yes (new)** |
| bazaar.listApps / listSkills | Probe + equip IDs |
| subscribeEvents / SSE custom | Not needed (waitForReply covers) |
| updateMindStatus | Not exposed in UI (Mind stays enabled) |

## Live Director probe (2026-08-22)

```
name: AFTERCUT.Director
mindId: 6bf0483e-f36b-1410-8466-00039ce7df11
cognition: ~1187
telegramBotId: 8840245437 (linked)
wallet: 0x5e28Fe9b… (present)
skills: Mastermind_Companion, Mastermind_Dormancy_Resync
apps: (equip VoiceTranscribe + YouTube Research Scout)
tools day: LLM_Turn, SKILL_LoadPlaybook
Builder Circle API = human collaborators by email — not multi-Mind slots
```

## Product truth

| Item | Truth |
|---|---|
| HOOKsmith / PLATFORMFIT / QC | Director **passes** + Memory receipts (jam allows single-agent) |
| Telegram → Studio auto-ingest | Bot linked; Studio still accepts paste (webhook = stretch) |
| Stripe | **Dropped** for jam |
| Cloud auth / social OAuth | Stretch after Mind depth + film — not dropped forever |

## Bug found + fix

Mind sometimes replies with HTML `<p>` chit-chat. Parse now strips HTML; prompts demand JSON/plain only.
