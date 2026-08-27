/**
 * Offline helpers kept for kit validation / caption scrub only.
 * Studio cuts are live Mind + AgentRouter only — never call atomizeText from product paths.
 */

import {
  platformLabel,
  platforms,
  type BrandKit,
  type Draft,
  type Platform,
  type Stage,
} from "./aftercut-data";

export type AtomizeError =
  | "NO_INGEST"
  | "EMPTY_TEXT"
  | "KIT_INCOMPLETE"
  | "TOO_SHORT";

export type AtomizeResult =
  | { ok: true; drafts: Draft[]; beatCount: number }
  | { ok: false; error: AtomizeError; message: string };

const PLATFORM_LIMITS: Record<Platform, { maxHook: number; voice: string }> = {
  shorts: { maxHook: 90, voice: "spoken hook + on-screen punch" },
  x: { maxHook: 200, voice: "tight post, one claim" },
  linkedin: { maxHook: 280, voice: "professional lead + lesson" },
  newsletter: { maxHook: 320, voice: "subject-style open + body teaser" },
};

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function kitIsReady(kit: BrandKit): boolean {
  return Boolean(kit.name.trim().length >= 2 && kit.tone.trim().length >= 3);
}

export function scrubDoNotSay(text: string, banned: string[]): string {
  let out = text;
  for (const raw of banned) {
    const b = raw.trim();
    if (!b) continue;
    const re = new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, "…");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Split long-form into story beats from the creator's text only. */
export function splitBeats(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  const byPara = cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40);

  if (byPara.length >= 2) return byPara.slice(0, 8);

  const bySentence = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24);

  if (bySentence.length >= 2) {
    const chunks: string[] = [];
    for (let i = 0; i < bySentence.length && chunks.length < 8; i += 2) {
      chunks.push(bySentence.slice(i, i + 2).join(" "));
    }
    return chunks;
  }

  if (cleaned.length < 48) return [];
  return [cleaned.slice(0, 400)];
}

function agentForPlatform(platform: Platform): string {
  if (platform === "shorts" || platform === "x") return "HOOKsmith";
  if (platform === "newsletter") return "QC";
  return "PLATFORMFIT";
}

function applyPlatformVoice(
  beat: string,
  platform: Platform,
  kit: BrandKit,
  index: number,
): string {
  const lim = PLATFORM_LIMITS[platform];
  const tone = kit.tone.trim();
  const cta = kit.ctas.find((c) => c.trim())?.trim() ?? "";
  const example = kit.examples.map((e) => e.trim()).filter(Boolean)[index % 3] ?? "";

  let body = beat.replace(/\s+/g, " ").trim();
  body = scrubDoNotSay(body, kit.doNotSay);

  // Hook open from example cadence if present
  if (example && platform === "x") {
    body = `${example.split(/[.!?]/)[0]!.slice(0, 40).trim()} — ${body}`;
  } else if (tone && platform === "linkedin") {
    body = `${tone.replace(/\.$/, "")}: ${body}`;
  } else if (platform === "shorts") {
    const first = body.split(/[.!?]/)[0] || body;
    body = first.length > 12 ? first : body;
  } else if (platform === "newsletter") {
    body = `This week: ${body}`;
  }

  if (body.length > lim.maxHook) {
    body = body.slice(0, lim.maxHook - 1).replace(/\s+\S*$/, "") + "…";
  }

  if (cta && !body.toLowerCase().includes(cta.toLowerCase().slice(0, 12))) {
    const space = lim.maxHook - body.length - cta.length - 1;
    if (space > 8) body = `${body}${body.endsWith(".") || body.endsWith("…") ? " " : ". "}${cta}`;
  }

  return body.trim();
}

export function atomizeText(input: {
  text: string;
  title: string;
  source: string;
  kit: BrandKit;
  ingestId?: string;
}): AtomizeResult {
  if (!kitIsReady(input.kit)) {
    return {
      ok: false,
      error: "KIT_INCOMPLETE",
      message: "Complete your brand voice first — add a name and tone.",
    };
  }

  const text = input.text.trim();
  if (!text) {
    return { ok: false, error: "EMPTY_TEXT", message: "Paste some content first." };
  }

  const beats = splitBeats(text);
  if (beats.length === 0) {
    return {
      ok: false,
      error: "TOO_SHORT",
      message: "Add more content — we need full sentences or paragraphs to work with.",
    };
  }

  const drafts: Draft[] = [];

  // Source card
  drafts.push({
    id: uid("dft"),
    title: input.title,
    platform: "shorts",
    stage: "ingested",
    source: input.source,
    hook: scrubDoNotSay(beats[0]!.slice(0, 100), input.kit.doNotSay) || "Raw long-form queued.",
    agent: "AFTERCUT Director",
    ingestId: input.ingestId,
  });

  // One draft per beat × rotate platforms; primary kit platform weighted first
  const order: Platform[] = [...platforms];
  const primaryRaw = input.kit.primaryPlatform?.trim().toLowerCase() ?? "";
  if (primaryRaw) {
    const match = platforms.find(
      (p) =>
        p === primaryRaw ||
        platformLabel[p].toLowerCase() === primaryRaw ||
        p.replace(/\s/g, "") === primaryRaw.replace(/\s/g, ""),
    );
    if (match) {
      order.splice(order.indexOf(match), 1);
      order.unshift(match);
    }
  }

  beats.forEach((beat, i) => {
    const platform = order[i % order.length]!;
    const hook = applyPlatformVoice(beat, platform, input.kit, i);
    const stage: Stage = i % 3 === 0 ? "needs-approve" : "drafting";
    drafts.push({
      id: uid("dft"),
      title: `${platformLabel[platform]} · cut ${i + 1}`,
      platform,
      stage,
      source: input.title,
      hook,
      agent: agentForPlatform(platform),
      ingestId: input.ingestId,
    });
  });

  return { ok: true, drafts, beatCount: beats.length };
}

/** Stable fingerprint for QC dupe checks (full-ish hook, not display preview). */
export function normalizeCaption(s: string): string {
  return s
    .toLowerCase()
    .replace(/…/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function captionFingerprint(hook: string): string {
  return normalizeCaption(hook);
}

export function proactiveRewriteHook(hook: string, kit: BrandKit): string {
  const tone = kit.tone.trim() || "your voice";
  const base = scrubDoNotSay(hook.replace(/\.$/, ""), kit.doNotSay);
  const harder = base.startsWith("Wait")
    ? base
    : `Wait — ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
  const cta = kit.ctas[0]?.trim();
  let out = `${harder} — sharper open, still ${tone}`;
  if (cta && out.length + cta.length < 300) out = `${out}. ${cta}`;
  return out.slice(0, 320);
}
