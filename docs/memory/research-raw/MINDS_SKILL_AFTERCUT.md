# AFTERCUT Skill — describe to Director Mind

> Source: Daniel Lin (Minds DevRel) 2026-08-27 Discord — Skills via Mind + CLI; **Apps too late for jam**; skill OK if **no authenticated outbound API calls**; use latest `@animocabrands/minds-client-lib`.
> Guide: https://build.hellominds.ai/agent-md/en/docs/guides/building-skills.md

## Product split (Minds-native)

| Layer | Owner |
|---|---|
| Ingest · Studio · brand kit · publish leash · overnight queue | AFTERCUT app (Vercel) |
| DNA-locked cut reasoning · platform fit · QC vs memory | **AFTERCUT Skill on creator's Mind** |
| Live evidence (Tavily/TinyFish) · OAuth publish | AFTERCUT app — pass results **into** Mind/Skill as context (skill does not call our servers) |

Do **not** build a GreenRoom-style custom App for submit. Skill = contextual reasoning Playbook.

## Paste to Mind (Telegram / CLI chat) — step 01 Describe

```text
Build me a Skill called "AFTERCUT Cut" for creator content repurposing.

Input I will give you each run:
1) Brand DNA — voice, taboos, logo/colors/fonts notes, audience
2) Source dump — transcript notes, title, platform hints (never invent quotes)
3) Optional live context — trends or verified updates I already fetched

Output every time, short and structured:
- What changed / what the source is about (1–2 lines)
- Why it matters for THIS creator's DNA (cite taboos/voice)
- Cuts: Shorts hook, X post, LinkedIn post, newsletter blurb — each in brand voice, no invented quotes from the dump
- QC: one line if anything risks spam, dupe, or taboo breach

Remember my approve/reject feedback so later cycles get sharper.
Do not call any external APIs or my AFTERCUT servers — reason only on what I paste in.
```

## Refine prompts

```text
Group cuts by platform. Keep Shorts under 20 words for the hook. Flag any taboo hits before the cuts.
```

```text
That's it. Build it.
```

## Run (after Skill exists)

```text
AFTERCUT Cut — DNA: [paste kit]. Dump: [paste ingest]. Trends: [optional]. Give me What changed → Why it matters → Cuts → QC.
```

## Inspect / publish (optional for jam)

```text
Show me what this Skill can do, what it reads, and what it can change. Flag anything it should not touch.
```

```text
Publish this Skill to the Bazaar as "AFTERCUT Cut" so creators can equip it.
```

## Status (2026-08-27) — **LIVE on AFTERCUT.Director**

| Field | Value |
|---|---|
| Mind | `AFTERCUT.Director` · `6bf0483e-…df11` |
| Skill name | **`creator-repurpose`** (Mind renamed from “AFTERCUT Cut”) |
| skillId | `F287513E-F36B-1410-8466-00039CE7DF11` |
| Equipped | `2026-08-27T12:11:57Z` · source=`mind` |
| **Bazaar** | **Listed** `isListed: true` · searchable as `creator-repurpose` · equippedCount 1 |
| Build transcript | `docs/memory/research-raw/skill-build/` |
| Alias | `aftercut-skill-build` |

Invoke shape Mind confirmed:

```text
REPURPOSE
Source: …
Voice: …
Examples: …
Primary platform: …
Live context: …
```

Studio atomize prompts now call this Skill by name, then map into Studio JSON.