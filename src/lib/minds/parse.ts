/**
 * Parse live Mind replies into AFTERCUT draft rows.
 * Expects JSON (raw or fenced). No fabricated content if parse fails.
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

function extractJsonBlob(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
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
