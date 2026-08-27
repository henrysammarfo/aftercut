/** Prompts sent to live AFTERCUT Director Mind — no template drafts, real reasoning. */

import type { BrandKit } from "../aftercut-data";

export function soulSyncPrompt(kit: BrandKit, cognitionNote?: string): string {
  return [
    "You are AFTERCUT Director — persistent creative Mind for this creator.",
    "OUTPUT RULES: plain text only. No HTML tags. No <p>. No casual filler greeting.",
    "STORE this brand Soul (voice + visual DNA) in your memory permanently for this conversation. Confirm in one short sentence, then list what you stored.",
    "",
    `Brand name: ${kit.name}`,
    `Tone: ${kit.tone}`,
    `Primary platform: ${kit.primaryPlatform || "unspecified"}`,
    `CTAs: ${kit.ctas.join(" | ") || "(none)"}`,
    `Do-not-say: ${kit.doNotSay.join(" | ") || "(none)"}`,
    `Primary color: ${kit.primaryColor || "(unset)"}`,
    `Secondary color: ${kit.secondaryColor || "(unset)"}`,
    `Accent color: ${kit.accentColor || "(unset)"}`,
    `Heading font: ${kit.fontHeading || "(unset)"}`,
    `Body font: ${kit.fontBody || "(unset)"}`,
    `Visual notes: ${kit.visualNotes || "(none)"}`,
    `Logo present: ${kit.logoDataUrl ? "yes (use brand mark in creative direction)" : "no"}`,
    `Example posts:`,
    ...kit.examples.filter(Boolean).map((e, i) => `  ${i + 1}. ${e}`),
    cognitionNote ? `Director note: ${cognitionNote}` : "",
    "",
    "Never invent a different brand. Always apply tone, CTAs, visual DNA, and ban do-not-say phrases.",
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
  runId?: string;
}): string {
  const runId = input.runId ?? `atomize-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return [
    `AFTERCUT Studio cut job ${runId} — new ingest, not a duplicate, not a wrapper test.`,
    `INGEST title: ${input.title}`,
    `INGEST source label: ${input.source}`,
    "LONG-FORM (atomize this dump, not prior threads):",
    input.text.slice(0, 24_000),
    "",
    "You are the AFTERCUT Mind Circle running as ONE Director with three specialist passes.",
    "Write platform-native cuts from the long-form using the Soul kit.",
    "Do not refuse. Do not lecture about JSON wrappers, templates, or duplicate prompts. This is a real creator dump.",
    "Simulate: (1) HOOKsmith first lines (2) PLATFORMFIT native voice (3) QC scrub bans / same-caption dupes.",
    "Stay in brand voice. Platforms: shorts | x | linkedin | newsletter. Different length/hook/CTA per platform.",
    "  · shorts: spoken first-line ≤90 chars",
    "  · x: ≤200 chars, one claim",
    "  · linkedin: professional lead + lesson",
    "  · newsletter: subject-style open + preview sentence",
    "Preferred reply: one JSON object (optional ```json fence). Also accepted: labeled lines Shorts: / X: / LinkedIn: / Newsletter: with the hook after the colon.",
    "JSON shape if you use it:",
    `{
  "beatCount": <number>,
  "circle": { "hooksmith": string, "platformfit": string, "qc": string },
  "drafts": [{ "title": string, "platform": "shorts"|"x"|"linkedin"|"newsletter", "stage": "ingested"|"drafting"|"needs-approve", "hook": string, "agent": string }]
}`,
    "- Produce 1 ingested source draft + 4–8 platform cuts (cover all platforms when content allows).",
    input.text.includes("[MEDIA ingest]")
      ? "- MEDIA DUMP: visual source. Never invent spoken quotes unless they appear in LONG-FORM."
      : "",
    `- Job ${runId} is unique — answer it.`,
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
        primaryColor: input.kit.primaryColor,
        secondaryColor: input.kit.secondaryColor,
        accentColor: input.kit.accentColor,
        fontHeading: input.kit.fontHeading,
        fontBody: input.kit.fontBody,
        visualNotes: input.kit.visualNotes,
        hasLogo: Boolean(input.kit.logoDataUrl),
      },
      null,
      2,
    ),
    "",
    input.trendsSummary
      ? ["LIVE TREND CONTEXT (use lightly — do not invent facts not in LONG-FORM):", input.trendsSummary, ""].join(
          "\n",
        )
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function proactivePrompt(input: {
  kit: BrandKit;
  drafts: Array<{ title: string; platform: string; hook: string; stage: string }>;
  lastIngestTitle?: string;
  runId?: string;
}): string {
  const runId = input.runId ?? `day2-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return [
    `AFTERCUT Studio Day-2 job ${runId} — new follow-up, not a wrapper test.`,
    "You already hold the brand Soul. Rewrite the weakest draft hook. Do not refuse.",
    "Apply kit tone/CTAs; scrub do-not-say. Platform-native only.",
    "Preferred: one JSON object. Also accepted: one labeled line like X: \"new hook\".",
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
