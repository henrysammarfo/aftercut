/**
 * Offline Studio tenant — creator data only (localStorage).
 * No network. No seeded P&L/drafts. Hellominds live bridge is out of band.
 */

import {
  emptyBrandKit,
  emptyDrafts,
  emptyIngests,
  emptyShipLedger,
  emptyTimeline,
  platformLabel,
  type BrandKit,
  type Draft,
  type IngestRecord,
  type MemoryEvent,
  type ShipEntry,
  type Stage,
} from "./aftercut-data";
import {
  atomizeText,
  kitIsReady,
  normalizeCaption,
  proactiveRewriteHook,
  type AtomizeError,
} from "./atomize";

export type TenantState = {
  userId: string;
  brandKit: BrandKit;
  drafts: Draft[];
  timeline: MemoryEvent[];
  shipLedger: ShipEntry[];
  ingests: IngestRecord[];
  cognitionNote: string;
  updatedAt: string;
};

function key(userId: string) {
  return `aftercut_tenant_v2_${userId}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function nowTs(): string {
  return new Date().toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `${hex.slice(0, 4)}…${hex.slice(-4)}`;
}

function empty(userId: string): TenantState {
  return {
    userId,
    brandKit: emptyBrandKit(),
    drafts: emptyDrafts(),
    timeline: emptyTimeline(),
    shipLedger: emptyShipLedger(),
    ingests: emptyIngests(),
    cognitionNote: "",
    updatedAt: new Date().toISOString(),
  };
}

export function loadTenant(userId: string): TenantState {
  if (typeof window === "undefined") return empty(userId);
  try {
    // migrate v1 key once
    const v2 = localStorage.getItem(key(userId));
    const v1 = localStorage.getItem(`aftercut_tenant_${userId}`);
    const raw = v2 || v1;
    if (!raw) return empty(userId);
    const parsed = JSON.parse(raw) as Partial<TenantState>;
    const state: TenantState = {
      ...empty(userId),
      ...parsed,
      userId,
      brandKit: { ...emptyBrandKit(), ...parsed.brandKit },
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      shipLedger: Array.isArray(parsed.shipLedger) ? parsed.shipLedger : [],
      ingests: Array.isArray(parsed.ingests) ? parsed.ingests : [],
      cognitionNote: parsed.cognitionNote ?? "",
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
    if (!v2 && v1) saveTenant(state);
    return state;
  } catch {
    return empty(userId);
  }
}

export function saveTenant(state: TenantState) {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(key(state.userId), JSON.stringify(next));
}

function persist(state: TenantState): TenantState {
  const next = { ...state, updatedAt: new Date().toISOString() };
  saveTenant(next);
  return next;
}

function event(
  day: MemoryEvent["day"],
  agent: string,
  title: string,
  detail: string,
  kind: MemoryEvent["kind"],
): MemoryEvent {
  return {
    id: `evt_${crypto.randomUUID().slice(0, 8)}`,
    day,
    time: nowTime(),
    agent,
    title,
    detail,
    kind,
  };
}

export type SaveKitResult =
  | { ok: true; state: TenantState }
  | { ok: false; message: string };

export function saveBrandKit(userId: string, kit: BrandKit): SaveKitResult {
  if (!kit.name.trim() || kit.name.trim().length < 2) {
    return { ok: false, message: "Brand name needs at least 2 characters." };
  }
  if (!kit.tone.trim() || kit.tone.trim().length < 3) {
    return { ok: false, message: "Tone needs at least 3 characters (Day 0 Soul requirement)." };
  }

  const state = loadTenant(userId);
  const examples = kit.examples.map((e) => e.trim());
  while (examples.length < 3) examples.push("");

  const cleaned: BrandKit = {
    name: kit.name.trim(),
    tone: kit.tone.trim(),
    examples: examples.slice(0, 3),
    ctas: kit.ctas.map((c) => c.trim()).filter(Boolean).slice(0, 8),
    doNotSay: kit.doNotSay.map((d) => d.trim()).filter(Boolean).slice(0, 16),
    primaryPlatform: kit.primaryPlatform?.trim() || "",
  };

  const next = persist({
    ...state,
    brandKit: cleaned,
    timeline: [
      ...state.timeline,
      event(
        "Day 0",
        "AFTERCUT Director",
        "Soul awakened",
        `Offline Soul stored for ${cleaned.name}: tone, examples, CTAs, do-not-say.`,
        "memory",
      ),
    ],
  });
  return { ok: true, state: next };
}

export function setCognitionNote(userId: string, note: string): TenantState {
  const state = loadTenant(userId);
  return persist({ ...state, cognitionNote: note.trim().slice(0, 500) });
}

export type AddIngestResult =
  | { ok: true; state: TenantState; ingestId: string }
  | { ok: false; message: string };

export function addIngest(
  userId: string,
  input: { title?: string; text: string; source?: string },
): AddIngestResult {
  const state = loadTenant(userId);
  const text = input.text.trim();
  if (text.length < 48) {
    return { ok: false, message: "Paste at least ~48 characters of long-form." };
  }
  if (text.length > 80_000) {
    return { ok: false, message: "Ingest too large (80k char cap offline)." };
  }

  const title =
    input.title?.trim() ||
    text.slice(0, 48).replace(/\s+/g, " ") + (text.length > 48 ? "…" : "");
  const ingest: IngestRecord = {
    id: `ing_${crypto.randomUUID().slice(0, 8)}`,
    title,
    text,
    source: input.source?.trim() || "Transcript paste",
    createdAt: new Date().toISOString(),
    status: "queued",
    beatCount: 0,
  };

  const next = persist({
    ...state,
    ingests: [ingest, ...state.ingests].slice(0, 40),
    timeline: [
      ...state.timeline,
      event(
        "Day 1",
        "Ingest",
        "Long-form dump received",
        `${ingest.source}: "${ingest.title}" queued (${text.length} chars).`,
        "action",
      ),
    ],
  });
  return { ok: true, state: next, ingestId: ingest.id };
}

export type AtomizeOpResult =
  | { ok: true; state: TenantState; beatCount: number; draftCount: number }
  | { ok: false; error: AtomizeError | "NO_INGEST"; message: string; state: TenantState };

export function atomizeIngest(userId: string, ingestId?: string): AtomizeOpResult {
  const state = loadTenant(userId);
  const target =
    (ingestId ? state.ingests.find((i) => i.id === ingestId) : null) ??
    state.ingests.find((i) => i.status === "queued") ??
    state.ingests[0];

  if (!target) {
    return {
      ok: false,
      error: "NO_INGEST",
      message: "Queue an ingest before atomizing.",
      state,
    };
  }

  const result = atomizeText({
    text: target.text,
    title: target.title,
    source: target.source,
    kit: state.brandKit,
  });

  if (!result.ok) {
    return { ok: false, error: result.error, message: result.message, state };
  }

  const ingests = state.ingests.map((i) =>
    i.id === target.id
      ? { ...i, status: "atomized" as const, beatCount: result.beatCount }
      : i,
  );

  const next = persist({
    ...state,
    ingests,
    drafts: [...result.drafts, ...state.drafts].slice(0, 200),
    timeline: [
      ...state.timeline,
      event(
        "Day 1",
        "PLATFORMFIT",
        "Platform variants drafted",
        `${result.beatCount} beat(s) → ${result.drafts.length - 1} platform draft(s) · offline atomizer · kit “${state.brandKit.name}”.`,
        "action",
      ),
      event(
        "Day 1",
        "HOOKsmith",
        "Hooks adapted",
        "Per-platform length + CTA/do-not-say scrub applied.",
        "action",
      ),
    ],
  });

  return {
    ok: true,
    state: next,
    beatCount: result.beatCount,
    draftCount: result.drafts.length,
  };
}

export type StageOpResult =
  | { ok: true; state: TenantState }
  | { ok: false; error: string; state: TenantState };

export function setDraftStage(
  userId: string,
  draftId: string,
  stage: Stage,
): StageOpResult {
  const state = loadTenant(userId);
  const draft = state.drafts.find((d) => d.id === draftId);
  if (!draft) return { ok: false, error: "Draft not found.", state };

  if (stage === "shipped") {
    if (draft.stage !== "scheduled") {
      return {
        ok: false,
        error: "Ship only after approve (scheduled). Publish leash.",
        state,
      };
    }
    const cap = normalizeCaption(draft.hook);
    const hit = state.shipLedger.find(
      (s) =>
        s.platform === platformLabel[draft.platform] &&
        normalizeCaption(s.caption) === cap,
    );
    if (hit) {
      const blocked = persist({
        ...state,
        timeline: [
          ...state.timeline,
          event(
            "Day 2",
            "QC",
            "Duplicate ship blocked",
            `Near-match ${hit.hash} already on ${hit.platform}.`,
            "denied",
          ),
        ],
      });
      return {
        ok: false,
        error: `QC blocked ship — matches ledger ${hit.hash}.`,
        state: blocked,
      };
    }
  }

  if (stage === "scheduled" && draft.stage === "ingested") {
    return { ok: false, error: "Advance through drafting first.", state };
  }

  const drafts = state.drafts.map((d) => (d.id === draftId ? { ...d, stage } : d));
  let shipLedger = state.shipLedger;
  let timeline = state.timeline;

  if (stage === "shipped") {
    const caption = draft.hook;
    const entry: ShipEntry = {
      hash: shortHash(`${draft.platform}|${normalizeCaption(caption)}|${Date.now()}`),
      platform: platformLabel[draft.platform],
      caption: caption.slice(0, 40) + (caption.length > 40 ? "…" : ""),
      ts: nowTs(),
    };
    shipLedger = [entry, ...shipLedger].slice(0, 100);
    timeline = [
      ...timeline,
      event(
        "Day 2",
        "QC",
        "Shipped to ledger",
        `${entry.platform} · ${entry.hash} remembered (offline ledger).`,
        "memory",
      ),
    ];
  }

  if (stage === "scheduled") {
    timeline = [
      ...timeline,
      event(
        "Day 2",
        "AFTERCUT Director",
        "Draft approved",
        `"${draft.title}" scheduled — human approved under publish leash.`,
        "action",
      ),
    ];
  }

  return { ok: true, state: persist({ ...state, drafts, shipLedger, timeline }) };
}

export function approveDraft(userId: string, draftId: string): TenantState {
  const res = setDraftStage(userId, draftId, "scheduled");
  return res.state;
}

export function rejectDraft(userId: string, draftId: string): TenantState {
  const state = loadTenant(userId);
  const draft = state.drafts.find((d) => d.id === draftId);
  const res = setDraftStage(userId, draftId, "drafting");
  if (!draft) return res.state;
  if (!res.ok) return res.state;
  return persist({
    ...res.state,
    timeline: [
      ...res.state.timeline,
      event(
        "Day 2",
        "AFTERCUT Director",
        "Draft rejected",
        `"${draft.title}" returned to drafting.`,
        "action",
      ),
    ],
  });
}

export function denyPublishAll(userId: string): { state: TenantState; detail: string } {
  const state = loadTenant(userId);
  const pending = state.drafts.filter(
    (d) => d.stage === "needs-approve" || d.stage === "drafting" || d.stage === "ingested",
  ).length;
  const scheduled = state.drafts.filter((d) => d.stage === "scheduled").length;
  const detail =
    pending + scheduled === 0
      ? "PUBLISH DENIED — queue empty; nothing to blast."
      : `"Post everything now" rejected — ${pending} unapproved · ${scheduled} scheduled still need explicit ship. Offline leash.`;

  const next = persist({
    ...state,
    timeline: [
      ...state.timeline,
      event("Day 2", "Publish leash", "PUBLISH DENIED", detail, "denied"),
    ],
  });
  return { state: next, detail };
}

export function appendTimeline(
  userId: string,
  partial: Omit<MemoryEvent, "id" | "time"> & { time?: string },
): TenantState {
  const state = loadTenant(userId);
  const evt: MemoryEvent = {
    id: `evt_${crypto.randomUUID().slice(0, 8)}`,
    time: partial.time ?? nowTime(),
    day: partial.day,
    agent: partial.agent,
    title: partial.title,
    detail: partial.detail,
    kind: partial.kind,
  };
  return persist({ ...state, timeline: [...state.timeline, evt].slice(-300) });
}

export function simulateDay2Followup(
  userId: string,
): { ok: true; state: TenantState } | { ok: false; message: string; state: TenantState } {
  const state = loadTenant(userId);
  if (!kitIsReady(state.brandKit)) {
    return {
      ok: false,
      message: "Save a complete brand kit (name + tone) first.",
      state,
    };
  }
  if (state.ingests.length === 0) {
    return { ok: false, message: "Add at least one ingest before Day 2.", state };
  }

  const draft =
    state.drafts.find((d) => d.stage === "needs-approve" || d.stage === "drafting") ??
    state.drafts.find((d) => d.stage !== "ingested") ??
    state.drafts[0];

  const label = draft?.title ?? state.ingests[0]!.title;
  let drafts = state.drafts;

  if (draft) {
    const rewriteHook = proactiveRewriteHook(draft.hook, state.brandKit);
    drafts = state.drafts.map((d) =>
      d.id === draft.id
        ? {
            ...d,
            hook: rewriteHook,
            stage: "needs-approve" as Stage,
            agent: "AFTERCUT Director",
            title: d.title.includes("rewritten") ? d.title : `${d.title} — rewritten hook`,
          }
        : d,
    );
  } else {
    // create proactive draft from kit + last ingest
    const ing = state.ingests[0]!;
    drafts = [
      {
        id: `dft_${crypto.randomUUID().slice(0, 8)}`,
        title: `${label} — proactive cut`,
        platform: "x",
        stage: "needs-approve",
        source: ing.title,
        hook: proactiveRewriteHook(ing.text.slice(0, 120), state.brandKit),
        agent: "AFTERCUT Director",
      },
      ...drafts,
    ];
  }

  const next = persist({
    ...state,
    drafts,
    timeline: [
      ...state.timeline,
      event(
        "Day 2",
        "AFTERCUT Director",
        "Proactive follow-up sent",
        `"${label}" needs a harder hook — rewritten from kit “${state.brandKit.name}” (offline). Approve or hold.`,
        "proactive",
      ),
    ],
  });

  return { ok: true, state: next };
}

/** Export tenant JSON for backup / demo continuity. */
export function exportTenantJson(userId: string): string {
  return JSON.stringify(loadTenant(userId), null, 2);
}

export function importTenantJson(
  userId: string,
  json: string,
): { ok: true; state: TenantState } | { ok: false; message: string } {
  try {
    const parsed = JSON.parse(json) as TenantState;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, message: "Invalid JSON." };
    }
    const state = persist({
      ...empty(userId),
      ...parsed,
      userId,
      brandKit: { ...emptyBrandKit(), ...parsed.brandKit },
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      shipLedger: Array.isArray(parsed.shipLedger) ? parsed.shipLedger : [],
      ingests: Array.isArray(parsed.ingests) ? parsed.ingests : [],
    });
    return { ok: true, state };
  } catch {
    return { ok: false, message: "Could not parse tenant JSON." };
  }
}

export function tenantHealth(state: TenantState) {
  return {
    kitReady: kitIsReady(state.brandKit),
    ingestCount: state.ingests.length,
    draftCount: state.drafts.length,
    needsApprove: state.drafts.filter((d) => d.stage === "needs-approve").length,
    shipped: state.shipLedger.length,
    denials: state.timeline.filter((t) => t.kind === "denied").length,
    proactive: state.timeline.filter((t) => t.kind === "proactive").length,
    mode: "offline" as const,
  };
}
