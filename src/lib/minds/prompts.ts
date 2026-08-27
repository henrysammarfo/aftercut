/** Prompts sent to live AFTERCUT Director Mind — brand DNA is law. No deviation. */

import type { BrandKit } from "../aftercut-data";

/** Compact Soul evidence block — GooseWorks-style: match voice + visual kit exactly. */
export function brandEvidenceBlock(kit: BrandKit): string {
  return [
    "BRAND EVIDENCE (immutable — do not invent or soften):",
    `name=${kit.name}`,
    `tone=${kit.tone}`,
    `platform=${kit.primaryPlatform || "unspecified"}`,
    `ctas=${kit.ctas.join(" · ") || "(none)"}`,
    `do_not_say=${kit.doNotSay.join(" · ") || "(none)"}`,
    `colors primary=${kit.primaryColor || "unset"} secondary=${kit.secondaryColor || "unset"} accent=${kit.accentColor || "unset"}`,
    `fonts heading=${kit.fontHeading || "unset"} body=${kit.fontBody || "unset"}`,
    `visual_notes=${kit.visualNotes || "(none)"}`,
    `logo=${kit.logoDataUrl ? "present — keep mark consistent; leave overlay space" : "absent"}`,
    "examples:",
    ...kit.examples.filter(Boolean).map((e, i) => `  ${i + 1}. ${e}`),
    "RULE: Match cadence, vocabulary, CTA style, and visual DNA. Never invent a different brand. Never hallucinate claims not in the dump or Soul.",
  ].join("\n");
}

export function soulSyncPrompt(kit: BrandKit, cognitionNote?: string): string {
  return [
    "You are AFTERCUT Director — persistent creative Mind for this creator.",
    "OUTPUT RULES: plain text only. No HTML tags. No <p>. No casual filler greeting.",
    "PERSISTENCE: STORE this brand Soul (voice + visual DNA) in your long-term memory for this conversation alias.",
    "On every future cut for this creator, RECALL this evidence. Do not drift. Do not invent a new brand.",
    "Confirm in one short sentence, then list every field you stored.",
    "",
    brandEvidenceBlock(kit),
    cognitionNote ? `Director note: ${cognitionNote}` : "",
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
    "Use your equipped Skill **creator-repurpose** (QC flags first, then platform cuts).",
    "Then map that Skill result into the Studio JSON below so the app can queue drafts.",
    "",
    "REPURPOSE",
    `Source: ${input.title} — ${input.text.slice(0, 24_000)}`,
    `Voice: ${input.kit.tone}; taboos: ${input.kit.doNotSay.join(", ") || "(none)"}; examples: ${input.kit.examples.filter(Boolean).slice(0, 3).join(" | ") || "(none)"}`,
    `Primary platform: ${input.kit.primaryPlatform || "all"}`,
    input.trendsSummary ? `Live context: ${input.trendsSummary}` : "Live context: (none)",
    "",
    "ANTI-HALLUCINATION: Only use facts from Source + Voice. No invented metrics, guests, quotes, or products.",
    "BRAND LOCK: Match Soul evidence exactly — GooseWorks-style, no brand drift.",
    "Do not refuse. Do not lecture about JSON wrappers. This is a real creator dump.",
    "Preferred reply: one JSON object (optional ```json fence). Also accepted: labeled lines Shorts: / X: / LinkedIn: / Newsletter: with the hook after the colon.",
    "JSON shape if you use it:",
    `{
  "beatCount": <number>,
  "circle": { "hooksmith": string, "platformfit": string, "qc": string },
  "drafts": [{ "title": string, "platform": "shorts"|"x"|"linkedin"|"newsletter", "stage": "ingested"|"drafting"|"needs-approve", "hook": string, "agent": string }]
}`,
    "- Produce 1 ingested source draft + 4–8 platform cuts (cover all platforms when content allows).",
    input.text.includes("[MEDIA ingest]")
      ? "- MEDIA DUMP: visual source. Never invent spoken quotes unless they appear in Source."
      : "",
    `- Job ${runId} is unique — answer it.`,
    "",
    brandEvidenceBlock(input.kit),
    "",
    input.trendsSummary
      ? [
          "LIVE TREND CONTEXT (use lightly — do not invent facts not in LONG-FORM):",
          input.trendsSummary,
          "",
        ].join("\n")
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
    "You already hold the brand Soul in memory. Rewrite the weakest draft hook. Do not refuse.",
    "ANTI-HALLUCINATION + BRAND LOCK: match tone/CTAs/visual DNA; scrub do-not-say; no invented claims.",
    "Preferred: one JSON object. Also accepted: one labeled line like X: \"new hook\".",
    `{ "title": string, "platform": "shorts"|"x"|"linkedin"|"newsletter", "hook": string, "agent": "AFTERCUT Director" }`,
    "",
    brandEvidenceBlock(input.kit),
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

/** Ask Mind to direct a post still (brand-locked). Prefer this before gateway images. */
export function imageBriefPrompt(input: {
  kit: BrandKit;
  title: string;
  hook: string;
  platform: string;
}): string {
  return [
    "AFTERCUT creative brief — generate a post still direction for this draft.",
    "If you can produce an image URL or data via equipped apps/tools, do it.",
    "Otherwise reply with ONE JSON object only:",
    `{ "prompt": string, "negative": string, "palette": string[], "composition": string }`,
    "prompt = detailed image-gen prompt locked to brand colors/fonts/logo space.",
    "Never invent a different brand. Never put unreadably small walls of text in the still.",
    "",
    `Platform: ${input.platform}`,
    `Title: ${input.title}`,
    `Hook: ${input.hook.slice(0, 400)}`,
    "",
    brandEvidenceBlock(input.kit),
  ].join("\n");
}
