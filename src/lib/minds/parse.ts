/**
 * Parse live Mind replies into AFTERCUT draft rows.
 * Expects JSON (raw or fenced). No fabricated content if parse fails.
 */

import { platforms, type Draft, type Platform, type Stage } from "../aftercut-data";

export type ParsedAtomize = {
  beatCount: number;
  drafts: Omit<Draft, "id">[];
  rawExcerpt: string;
};

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractJsonBlob(text: string): unknown {
  const normalized = stripHtml(text);
  const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? normalized).trim();
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

function platformFromLabel(label: string): Platform | null {
  const t = label.toLowerCase();
  if (t.includes("short")) return "shorts";
  if (t === "x" || t.startsWith("x ") || t.includes("twitter")) return "x";
  if (t.includes("linkedin")) return "linkedin";
  if (t.includes("newsletter")) return "newsletter";
  return null;
}

/** Parse conversational Mind replies (HTML/prose) when JSON is refused. */
export function parseProseAtomizeReply(
  replyText: string,
  meta: { title: string; source: string; ingestId?: string },
): ParsedAtomize {
  const text = stripHtml(replyText);
  const drafts: Omit<Draft, "id">[] = [];

  const platformBlock =
    /(?:^|\n)\s*(Shorts|X|LinkedIn|Newsletter)\b[^\n]*\n(?:"([^"]+)"(?:\s*\(\d+\s*chars?\))?|Subject:\s*"([^"]+)"[^\n]*\nPreview:\s*"([^"]+)")/gi;

  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = platformBlock.exec(text)) !== null) {
    const platform = platformFromLabel(match[1] ?? "");
    if (!platform) continue;
    let hook = "";
    if (match[3] && match[4]) {
      hook = `Subject: ${match[3]} · Preview: ${match[4]}`;
    } else {
      hook = (match[2] ?? "").trim();
    }
    if (!hook) continue;
    drafts.push({
      title: `${platform} · cut ${idx + 1}`,
      platform,
      stage: idx === 0 ? "ingested" : "needs-approve",
      source: meta.title,
      hook,
      agent: "AFTERCUT Director",
      ingestId: meta.ingestId,
    });
    idx++;
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
  try {
    return parseAtomizeReply(replyText, meta);
  } catch {
    return parseProseAtomizeReply(replyText, meta);
  }
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

  return {
    beatCount: Number.isFinite(beatCount) ? beatCount : drafts.length,
    drafts,
    rawExcerpt: replyText.slice(0, 280),
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

export function parseProactiveReplyFlexible(replyText: string): {
  title: string;
  hook: string;
  platform: Platform;
  agent: string;
} {
  try {
    return parseProactiveReply(replyText);
  } catch {
    const text = stripHtml(replyText);
    for (const platform of ["shorts", "x", "linkedin", "newsletter"] as const) {
      const re = new RegExp(`${platform}[^\\n"]*"([^"]+)"`, "i");
      const m = text.match(re);
      if (m?.[1]) {
        return {
          title: "Proactive rewrite",
          hook: m[1].trim(),
          platform,
          agent: "AFTERCUT Director",
        };
      }
    }
    const quoted = text.match(/"([^"]{12,})"/);
    if (quoted?.[1]) {
      return {
        title: "Proactive rewrite",
        hook: quoted[1].trim(),
        platform: "x",
        agent: "AFTERCUT Director",
      };
    }
    throw new Error("No proactive hook found in Mind prose reply");
  }
}
