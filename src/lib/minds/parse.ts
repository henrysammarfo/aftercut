/**
 * Parse live Mind replies into AFTERCUT draft rows.
 * Expects JSON (raw or fenced). No fabricated content if parse fails.
 * Minds often wrap replies in HTML <p> — strip before JSON extract.
 */

import { platforms, type Draft, type Platform, type Stage } from "../aftercut-data";

export type CirclePasses = {
  hooksmith: string;
  platformfit: string;
  qc: string;
};

export type ParsedAtomize = {
  beatCount: number;
  drafts: Omit<Draft, "id">[];
  circle?: CirclePasses;
  rawExcerpt: string;
};

/** Strip hellominds HTML chat wrappers so JSON survives. */
export function stripMindHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/g, '"')
    .replace(/&lsquo;|&rsquo;|&#8216;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractJsonBlob(text: string): unknown {
  const cleaned = stripMindHtml(text);
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? cleaned).trim();
  // Try whole
  try {
    return JSON.parse(candidate);
  } catch {
    /* find first { or [ */
  }
  const startObj = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  let start = -1;
  if (startObj >= 0 && (startArr < 0 || startObj < startArr)) start = startObj;
  else if (startArr >= 0) start = startArr;
  if (start < 0) throw new Error("No JSON object/array in Mind reply");

  const slice = candidate.slice(start);
  // Balance braces/brackets
  let depth = 0;
  let end = -1;
  const open = slice[0];
  const close = open === "[" ? "]" : "}";
  for (let i = 0; i < slice.length; i++) {
    const ch = slice[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error("Unbalanced JSON in Mind reply");
  return JSON.parse(slice.slice(0, end));
}

function isPlatform(p: string): p is Platform {
  return (platforms as string[]).includes(p);
}

function isStage(s: string): s is Stage {
  return ["ingested", "drafting", "needs-approve", "scheduled", "shipped"].includes(s);
}

export function parseAtomizeReply(
  replyText: string,
  meta: { title: string; source: string; ingestId?: string },
): ParsedAtomize {
  const data = extractJsonBlob(replyText) as {
    beatCount?: number;
    beats?: number;
    drafts?: Array<Record<string, unknown>>;
    circle?: Record<string, unknown>;
  };

  const list = Array.isArray(data)
    ? (data as Array<Record<string, unknown>>)
    : Array.isArray(data.drafts)
      ? data.drafts
      : null;

  if (!list || list.length === 0) {
    throw new Error("Mind reply JSON has no drafts[]");
  }

  const drafts: Omit<Draft, "id">[] = list.map((row, i) => {
    const platformRaw = String(row.platform ?? "x").toLowerCase();
    const platform: Platform = isPlatform(platformRaw) ? platformRaw : "x";
    const stageRaw = String(row.stage ?? (i === 0 ? "ingested" : "needs-approve"));
    const stage: Stage = isStage(stageRaw) ? stageRaw : "needs-approve";
    const hook = String(row.hook ?? row.caption ?? row.text ?? "").trim();
    if (!hook) throw new Error(`Mind draft ${i} missing hook`);
    return {
      title: String(row.title ?? `${platform} · cut ${i + 1}`),
      platform,
      stage,
      source: meta.title,
      hook,
      agent: String(row.agent ?? "AFTERCUT Director"),
      ingestId: meta.ingestId,
      proactive: Boolean(row.proactive),
    };
  });

  const beatCount =
    typeof data === "object" && data && !Array.isArray(data)
      ? Number(data.beatCount ?? data.beats ?? drafts.length)
      : drafts.length;

  let circle: CirclePasses | undefined;
  if (typeof data === "object" && data && !Array.isArray(data) && data.circle) {
    const c = data.circle;
    const hooksmith = String(c.hooksmith ?? c.HOOKsmith ?? "").trim();
    const platformfit = String(c.platformfit ?? c.PLATFORMFIT ?? "").trim();
    const qc = String(c.qc ?? c.QC ?? "").trim();
    if (hooksmith || platformfit || qc) {
      circle = {
        hooksmith: hooksmith || "HOOKsmith pass complete",
        platformfit: platformfit || "PLATFORMFIT pass complete",
        qc: qc || "QC pass complete",
      };
    }
  }

  return {
    beatCount: Number.isFinite(beatCount) ? beatCount : drafts.length,
    drafts,
    circle,
    rawExcerpt: replyText.slice(0, 280),
  };
}

/** Director meta-chat after repeated JSON-template traffic. */
export function looksLikeJsonRefusal(text: string): boolean {
  const t = stripMindHtml(text);
  if (/"drafts"\s*:/.test(t) || /"hook"\s*:/.test(t)) return false;
  return /refus(e|ing|al).{0,48}json|json.{0,48}refus|duplicate (prompt|job|request|ingest)|won'?t (output|return) json|cannot output (only )?json|not going to (output|wrap|repeat)|json wrapper|wrapper (test|refusal|prompt|template)/i.test(
    t,
  );
}

function platformFromLabel(label: string): Platform | null {
  const t = label.toLowerCase();
  if (t.includes("short")) return "shorts";
  if (t === "x" || t.startsWith("x ") || t.includes("twitter")) return "x";
  if (t.includes("linkedin")) return "linkedin";
  if (t.includes("newsletter")) return "newsletter";
  return null;
}

function draftRow(
  platform: Platform,
  hook: string,
  idx: number,
  meta: { title: string; ingestId?: string },
): Omit<Draft, "id"> {
  const row: Omit<Draft, "id"> = {
    title: `${platform} · cut ${idx + 1}`,
    platform,
    stage: idx === 0 ? "ingested" : "needs-approve",
    source: meta.title,
    hook,
    agent: "AFTERCUT Director",
  };
  if (meta.ingestId) row.ingestId = meta.ingestId;
  return row;
}

/** Conversational / labeled cuts when JSON is refused. */
export function parseProseAtomizeReply(
  replyText: string,
  meta: { title: string; source: string; ingestId?: string },
): ParsedAtomize {
  if (looksLikeJsonRefusal(replyText)) {
    throw new Error("Mind refused JSON template");
  }
  const text = stripMindHtml(replyText);
  const drafts: Omit<Draft, "id">[] = [];
  const seen = new Set<string>();

  const quotedBlock =
    /(?:^|\n)\s*(Shorts|YouTube Shorts|X|Twitter|LinkedIn|Newsletter)\b[^\n]*\n(?:"([^"]+)"(?:\s*\(\d+\s*chars?\))?|Subject:\s*"([^"]+)"[^\n]*\nPreview:\s*"([^"]+)")/gi;
  let match: RegExpExecArray | null;
  while ((match = quotedBlock.exec(text)) !== null) {
    const platform = platformFromLabel(match[1] ?? "");
    if (!platform) continue;
    const hook =
      match[3] && match[4]
        ? `Subject: ${match[3]} · Preview: ${match[4]}`
        : (match[2] ?? "").trim();
    if (!hook) continue;
    const key = `${platform}:${hook.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    drafts.push(draftRow(platform, hook, drafts.length, meta));
  }

  const lineRe =
    /(?:^|\n)\s*(?:\d+[.)]\s*)?(?:\*\*)?(Shorts|YouTube Shorts|X|Twitter|LinkedIn|Newsletter)(?:\*\*)?\s*[:\-–]\s*[“"]?(.+?)[”"]?(?=\n|$)/gi;
  while ((match = lineRe.exec(text)) !== null) {
    const platform = platformFromLabel(match[1] ?? "");
    const hook = (match[2] ?? "").trim().replace(/^["“]|["”]$/g, "");
    if (!platform || hook.length < 8) continue;
    const key = `${platform}:${hook.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    drafts.push(draftRow(platform, hook, drafts.length, meta));
  }

  if (drafts.length === 0) {
    throw new Error("No platform drafts found in Mind prose reply");
  }

  return {
    beatCount: drafts.length,
    drafts,
    rawExcerpt: replyText.slice(0, 280),
  };
}

export function parseAtomizeReplyFlexible(
  replyText: string,
  meta: { title: string; source: string; ingestId?: string },
): ParsedAtomize {
  if (!looksLikeJsonRefusal(replyText)) {
    try {
      return parseAtomizeReply(replyText, meta);
    } catch {
      /* prose */
    }
  }
  return parseProseAtomizeReply(replyText, meta);
}

export function parseProactiveReplyFlexible(replyText: string): {
  title: string;
  hook: string;
  platform: Platform;
  agent: string;
} {
  if (!looksLikeJsonRefusal(replyText)) {
    try {
      return parseProactiveReply(replyText);
    } catch {
      /* prose */
    }
  }
  const text = stripMindHtml(replyText);
  if (looksLikeJsonRefusal(text)) {
    throw new Error("Mind refused JSON template");
  }
  const labeled = text.match(
    /(?:Shorts|X|Twitter|LinkedIn|Newsletter)\s*[:\-–]\s*[“"]?(.{12,280}?)[”"]?(?:\n|$)/i,
  );
  const quoted = text.match(/"([^"]{12,280})"/);
  const hookLine = text.match(/(?:hook|rewrite|new line)\s*[:\-]\s*(.+)/i);
  const hook = (labeled?.[1] || quoted?.[1] || hookLine?.[1] || "").trim();
  if (!hook) throw new Error("Mind proactive reply missing hook");
  const platform = platformFromLabel(labeled?.[0] ?? "") ?? "x";
  return {
    title: "Proactive rewrite",
    hook,
    platform,
    agent: "AFTERCUT Director",
  };
}

export function parseProactiveReply(replyText: string): {
  title: string;
  hook: string;
  platform: Platform;
  agent: string;
} {
  const data = extractJsonBlob(replyText) as Record<string, unknown>;
  const hook = String(data.hook ?? data.caption ?? data.text ?? "").trim();
  if (!hook) throw new Error("Mind proactive reply missing hook");
  const platformRaw = String(data.platform ?? "x").toLowerCase();
  return {
    title: String(data.title ?? "Proactive rewrite"),
    hook,
    platform: isPlatform(platformRaw) ? platformRaw : "x",
    agent: String(data.agent ?? "AFTERCUT Director"),
  };
}
