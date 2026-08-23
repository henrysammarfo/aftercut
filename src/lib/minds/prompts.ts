/** Prompts sent to live AFTERCUT Director Mind — no template drafts, real reasoning. */

import type { BrandKit } from "../aftercut-data";

export function soulSyncPrompt(kit: BrandKit, cognitionNote?: string): string {
  return [
    "You are AFTERCUT Director — persistent creative Mind for this creator.",
    "OUTPUT RULES: plain text only. No HTML tags. No <p>. No casual filler greeting.",
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
  trendsSummary?: string;
}): string {
  return [
    "TASK: Atomize long-form into platform drafts.",
    "Your reply MUST begin with the character { and MUST be ONLY a JSON object. Zero prose before or after.",
    "Do not mention threads, prompts, schemas, or prior messages.",
    "Schema:",
    `{
  "beatCount": <number>,
  "circle": {
    "hooksmith": string,
    "platformfit": string,
    "qc": string
  },
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
    "Rules:",
    "- Stay in brand voice; scrub every do-not-say phrase from every hook.",
    "- Native drafts: Shorts ≤90 chars energy; X ≤200 one claim; LinkedIn lesson lines; newsletter subject+preview.",
    "- Never identical captions across platforms.",
    "- Produce 1 ingested source draft + 4–8 platform cuts covering all platforms when possible.",
    "- agents: HOOKsmith | PLATFORMFIT | QC | AFTERCUT Director",
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
    `SOURCE title: ${input.title}`,
    `SOURCE type: ${input.source}`,
    input.trendsSummary ? `TRENDS:\n${input.trendsSummary}` : "",
    "LONG-FORM:",
    input.text,
    "",
    "BEGIN JSON NOW.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function proactivePrompt(input: {
  kit: BrandKit;
  drafts: Array<{ title: string; platform: string; hook: string; stage: string }>;
  lastIngestTitle?: string;
}): string {
  return [
    "You are AFTERCUT Director. Day-2 continuity: you already hold the brand Soul.",
    "OUTPUT RULES (hard): Reply with ONLY one JSON object. No HTML. No greeting. No filler.",
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
    "OUTPUT: one plain sentence. No HTML.",
    "Creator attempted blast-publish. You must NOT publish. Confirm leash in one sentence.",
    `Detail: ${detail}`,
  ].join("\n");
}
