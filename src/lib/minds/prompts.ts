/** Prompts sent to live AFTERCUT Director Mind — no template drafts, real reasoning. */

import type { BrandKit } from "../aftercut-data";

export function soulSyncPrompt(kit: BrandKit, cognitionNote?: string): string {
  return [
    "You are AFTERCUT Director — persistent creative Mind for this creator.",
    "STORE this brand Soul in your memory permanently for this conversation. Confirm in one short sentence, then list what you stored.",
    "",
    `Brand name: ${kit.name}`,
    `Tone: ${kit.tone}`,
    `Primary platform: ${kit.primaryPlatform || "unspecified"}`,
    `CTAs: ${kit.ctas.join(" | ") || "(none)"}`,
    `Do-not-say: ${kit.doNotSay.join(" | ") || "(none)"}`,
    `Example posts:`,
    ...kit.examples.filter(Boolean).map((e, i) => `  ${i + 1}. ${e}`),
    cognitionNote ? `Director note: ${cognitionNote}` : "",
    "",
    "Never invent a different brand. Always apply tone, CTAs, and ban do-not-say phrases.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function atomizePrompt(input: {
  kit: BrandKit;
  title: string;
  source: string;
  text: string;
}): string {
  return [
    "You are the AFTERCUT Mind Circle (Director + HOOKsmith + PLATFORMFIT + QC roles).",
    "Atomize this long-form into platform-native drafts using the Soul kit below.",
    "Hard rules — production, no shortcuts:",
    "- Stay in brand voice; scrub every do-not-say phrase from every hook/caption.",
    "- Platforms allowed: shorts | x | linkedin | newsletter only.",
    "- NATIVE ≠ cross-post: each platform draft must use different length, hook shape, and CTA framing. NEVER copy-paste the same caption across platforms.",
    "  · shorts: spoken first-line hook ≤90 chars energy, on-screen punch implied, no LinkedIn essay.",
    "  · x: ≤200 chars, one claim, optional 1–2 hashtags max, no corporate padding.",
    "  · linkedin: professional lead + lesson, 1–3 short lines, no TikTok slang.",
    "  · newsletter: subject-style open + 1 preview sentence teaser.",
    "- stages: one source card stage ingested; others drafting or needs-approve.",
    "- agents: AFTERCUT Director | HOOKsmith | PLATFORMFIT | QC",
    "- No markdown outside a single JSON object.",
    "- Reply with ONLY this JSON shape:",
    `{
  "beatCount": <number>,
  "drafts": [
    {
      "title": string,
      "platform": "shorts"|"x"|"linkedin"|"newsletter",
      "stage": "ingested"|"drafting"|"needs-approve",
      "hook": string,
      "agent": string
    }
  ]
}`,
    "- Produce 1 ingested source draft + 4–8 platform cuts from real beats in the text (cover all platforms at least once when content allows).",
    "- QC: if a ban phrase slips into a hook, rewrite that hook before answering.",
    "",
    "SOUL KIT:",
    JSON.stringify(
      {
        name: input.kit.name,
        tone: input.kit.tone,
        examples: input.kit.examples,
        ctas: input.kit.ctas,
        doNotSay: input.kit.doNotSay,
        primaryPlatform: input.kit.primaryPlatform,
      },
      null,
      2,
    ),
    "",
    `INGEST title: ${input.title}`,
    `INGEST source label: ${input.source}`,
    "LONG-FORM:",
    input.text.slice(0, 24_000),
  ].join("\n");
}

export function proactivePrompt(input: {
  kit: BrandKit;
  drafts: Array<{ title: string; platform: string; hook: string; stage: string }>;
  lastIngestTitle?: string;
}): string {
  return [
    "You are AFTERCUT Director. Day-2 continuity: you already hold the brand Soul.",
    "Proactively rewrite the weakest draft hook without waiting for a new brief.",
    "Apply kit tone/CTAs; scrub do-not-say. Platform-native only (no generic cross-post copy).",
    "Prefer rewriting a needs-approve or drafting card whose hook is soft/vague/coin-flip.",
    "Reply ONLY with JSON:",
    `{ "title": string, "platform": "shorts"|"x"|"linkedin"|"newsletter", "hook": string, "agent": "AFTERCUT Director" }`,
    "",
    "SOUL:",
    JSON.stringify({ name: input.kit.name, tone: input.kit.tone, ctas: input.kit.ctas, doNotSay: input.kit.doNotSay }),
    "",
    `Last ingest: ${input.lastIngestTitle ?? "n/a"}`,
    "CURRENT QUEUE:",
    JSON.stringify(input.drafts.slice(0, 12), null, 2),
  ].join("\n");
}

export function publishDeniedPrompt(detail: string): string {
  return [
    "Publish leash log for memory.",
    "Creator attempted blast-publish. You must NOT publish. Confirm leash in one sentence.",
    `Detail: ${detail}`,
  ].join("\n");
}
