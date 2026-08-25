/**
 * Tenant ledger — stores live Mind outputs + ship rules (localStorage).
 * Generation is via hellominds Builder API only (see src/lib/minds/*).
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
  captionFingerprint,
  kitIsReady,
  normalizeCaption,
  scrubDoNotSay,
} from "./atomize";
import { formatMediaBrief } from "./media-ingest";

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

/** In-memory tenant for server handlers (paired with Postgres load/save). */
const serverTenantCache = new Map<string, TenantState>();

export function primeServerTenant(state: TenantState) {
  serverTenantCache.set(state.userId, state);
}

export function takeServerTenant(userId: string): TenantState | null {
  const s = serverTenantCache.get(userId) ?? null;
  serverTenantCache.delete(userId);
  return s;
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
  if (typeof window === "undefined") {
    return serverTenantCache.get(userId) ?? empty(userId);
  }
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
  if (typeof window === "undefined") {
    const next = { ...state, updatedAt: new Date().toISOString() };
    serverTenantCache.set(state.userId, next);
    return;
  }
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

const TIMELINE_MAX = 300;

function pushEvents(timeline: MemoryEvent[], ...evts: MemoryEvent[]): MemoryEvent[] {
  return [...timeline, ...evts].slice(-TIMELINE_MAX);
}

function ledgerFingerprint(entry: ShipEntry): string {
  return entry.fingerprint || normalizeCaption(entry.caption);
}

export type SaveKitResult =
  | { ok: true; state: TenantState }
  | { ok: false; message: string };

export function saveBrandKit(userId: string, kit: BrandKit): SaveKitResult {
  if (!kit.name.trim() || kit.name.trim().length < 2) {
    return { ok: false, message: "Brand name needs at least 2 characters." };
  }
  if (!kit.tone.trim() || kit.tone.trim().length < 3) {
    return { ok: false, message: "Tone needs at least 3 characters." };
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
    timeline: pushEvents(
      state.timeline,
      event(
        "Setup",
        "AFTERCUT Director",
        "Brand voice saved",
        `Stored for ${cleaned.name}: tone, examples, CTAs, and banned phrases.`,
        "memory",
      ),
    ),
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
  input: { title?: string; text: string; source?: string; media?: IngestRecord["media"] },
): AddIngestResult {
  const state = loadTenant(userId);
  let text = input.text.trim();
  const hasMedia = Boolean(input.media);
  if (input.media && (text.length < 48 || !text.includes("[MEDIA ingest]"))) {
    text = formatMediaBrief(input.media, text);
  }
  if (!hasMedia && text.length < 48) {
    return { ok: false, message: "Paste at least 48 characters, or drop an image / video." };
  }
  if (text.length > 80_000) {
    return { ok: false, message: "Content is too long (80,000 character limit)." };
  }

  const title =
    input.title?.trim() ||
    input.media?.filename ||
    text.slice(0, 48).replace(/\s+/g, " ") + (text.length > 48 ? "…" : "");
  const ingest: IngestRecord = {
    id: `ing_${crypto.randomUUID().slice(0, 8)}`,
    title,
    text,
    source:
      input.source?.trim() ||
      (input.media?.kind === "video"
        ? "Video upload"
        : input.media?.kind === "image"
          ? "Image upload"
          : "Transcript paste"),
    createdAt: new Date().toISOString(),
    status: "queued",
    beatCount: 0,
    media: input.media,
  };

  const next = persist({
    ...state,
    ingests: [ingest, ...state.ingests].slice(0, 40),
    timeline: pushEvents(
      state.timeline,
      event(
        "Content",
        "Import",
        "Content received",
        ingest.media
          ? `${ingest.source}: "${ingest.title}" (${ingest.media.kind} · ${text.length} characters).`
          : `${ingest.source}: "${ingest.title}" added (${text.length} characters).`,
        "action",
      ),
    ),
  });
  return { ok: true, state: next, ingestId: ingest.id };
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
        error: "Approve this draft before marking it published.",
        state,
      };
    }
    const fp = captionFingerprint(draft.hook);
    const hit = state.shipLedger.find(
      (s) => s.platform === platformLabel[draft.platform] && ledgerFingerprint(s) === fp,
    );
    if (hit) {
      const blocked = persist({
        ...state,
        timeline: pushEvents(
          state.timeline,
          event(
            "Follow-up",
            "QC",
            "Duplicate blocked",
            `Already published similar copy to ${hit.platform} (${hit.hash}).`,
            "denied",
          ),
        ),
      });
      return {
        ok: false,
        error: `This caption matches something you already published (${hit.hash}).`,
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
    const fp = captionFingerprint(draft.hook);
    const caption = draft.hook;
    const entry: ShipEntry = {
      hash: shortHash(`${draft.platform}|${fp}`),
      fingerprint: fp,
      platform: platformLabel[draft.platform],
      caption: caption.slice(0, 40) + (caption.length > 40 ? "…" : ""),
      ts: nowTs(),
    };
    shipLedger = [entry, ...shipLedger].slice(0, 100);
    timeline = pushEvents(
      timeline,
      event(
        "Follow-up",
        "QC",
        "Marked published",
        `${entry.platform} · saved to history (${entry.hash}).`,
        "memory",
      ),
    );
  }

  if (stage === "scheduled") {
    timeline = pushEvents(
      timeline,
      event(
        "Follow-up",
        "AFTERCUT Director",
        "Draft approved",
        `"${draft.title}" is ready to publish when you mark it published.`,
        "action",
      ),
    );
  }

  return { ok: true, state: persist({ ...state, drafts, shipLedger, timeline }) };
}

export function approveDraft(
  userId: string,
  draftId: string,
): StageOpResult {
  return setDraftStage(userId, draftId, "scheduled");
}

export function rejectDraft(
  userId: string,
  draftId: string,
): StageOpResult {
  const state = loadTenant(userId);
  const draft = state.drafts.find((d) => d.id === draftId);
  const res = setDraftStage(userId, draftId, "drafting");
  if (!draft) return res;
  if (!res.ok) return res;
  return {
    ok: true,
    state: persist({
      ...res.state,
      timeline: pushEvents(
        res.state.timeline,
        event(
          "Follow-up",
          "AFTERCUT Director",
          "Draft rejected",
          `"${draft.title}" returned to drafting.`,
          "action",
        ),
      ),
    }),
  };
}

export function denyPublishAll(userId: string): { state: TenantState; detail: string } {
  const state = loadTenant(userId);
  const pending = state.drafts.filter(
    (d) => d.stage === "needs-approve" || d.stage === "drafting" || d.stage === "ingested",
  ).length;
  const scheduled = state.drafts.filter((d) => d.stage === "scheduled").length;
  const detail =
    pending + scheduled === 0
      ? "Nothing ready to publish — your queue is empty."
      : `Bulk publish blocked — ${pending} draft${pending === 1 ? "" : "s"} still need approval · ${scheduled} scheduled and waiting for you to mark published.`;

  const next = persist({
    ...state,
    timeline: pushEvents(
      state.timeline,
      event("Follow-up", "Publish guard", "Publishing blocked", detail, "denied"),
    ),
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
  return persist({ ...state, timeline: pushEvents(state.timeline, evt) });
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
    return { ok: false, message: "Could not read backup file." };
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
    mode: "live" as const,
  };
}

/** Apply drafts returned by live AFTERCUT Director Mind. */
export function applyLiveAtomize(
  userId: string,
  input: {
    ingestId: string;
    beatCount: number;
    mindName: string;
    mindId: string;
    drafts: Array<{
      title: string;
      platform: string;
      stage: string;
      hook: string;
      agent: string;
      proactive?: boolean;
    }>;
    circle?: { hooksmith: string; platformfit: string; qc: string };
    trendsUsed?: boolean;
  },
): TenantState {
  const state = loadTenant(userId);
  const target = state.ingests.find((i) => i.id === input.ingestId);
  const ingests = state.ingests.map((i) =>
    i.id === input.ingestId
      ? { ...i, status: "atomized" as const, beatCount: input.beatCount }
      : i,
  );

  const title = target?.title ?? "ingest";
  const banned = state.brandKit.doNotSay;
  const newDrafts: Draft[] = input.drafts.map((d) => ({
    id: `dft_${crypto.randomUUID().slice(0, 8)}`,
    title: scrubDoNotSay(d.title, banned),
    platform: (["shorts", "x", "linkedin", "newsletter"].includes(d.platform)
      ? d.platform
      : "x") as Draft["platform"],
    stage: (["ingested", "drafting", "needs-approve", "scheduled", "shipped"].includes(d.stage)
      ? d.stage
      : "needs-approve") as Stage,
    source: title,
    hook: scrubDoNotSay(d.hook, banned),
    agent: d.agent || input.mindName,
    ingestId: input.ingestId,
    proactive: d.proactive,
  }));

  const kept = state.drafts.filter(
    (d) => d.ingestId !== input.ingestId && d.source !== title,
  );

  const passEvents: MemoryEvent[] = [];
  if (input.circle) {
    passEvents.push(
      event("Content", "HOOKsmith", "Hooks refined", input.circle.hooksmith.slice(0, 280), "action"),
      event(
        "Content",
        "PLATFORMFIT",
        "Platforms adapted",
        input.circle.platformfit.slice(0, 280),
        "action",
      ),
      event("Content", "QC", "Quality checked", input.circle.qc.slice(0, 280), "action"),
    );
  }
  passEvents.push(
    event(
      "Content",
      input.mindName,
      "Drafts generated",
      `${input.beatCount} key moment${input.beatCount === 1 ? "" : "s"} · ${newDrafts.length} platform draft${newDrafts.length === 1 ? "" : "s"}${
        input.trendsUsed ? " · trend-aware" : ""
      }`,
      "action",
    ),
  );

  return persist({
    ...state,
    ingests,
    drafts: [...newDrafts, ...kept].slice(0, 200),
    timeline: pushEvents(state.timeline, ...passEvents),
  });
}

export function applyLiveProactive(
  userId: string,
  input: {
    title: string;
    hook: string;
    platform: string;
    agent: string;
    mindName: string;
    mindId: string;
  },
): TenantState {
  const state = loadTenant(userId);
  const platform = (["shorts", "x", "linkedin", "newsletter"].includes(input.platform)
    ? input.platform
    : "x") as Draft["platform"];

  // Prefer rewrite an existing soft draft; else push new needs-approve card
  const soft =
    state.drafts.find((d) => d.stage === "needs-approve" || d.stage === "drafting") ??
    state.drafts.find((d) => d.stage !== "ingested");

  let drafts: Draft[];
  const banned = state.brandKit.doNotSay;
  const scrubbedTitle = scrubDoNotSay(input.title, banned);
  const scrubbedHook = scrubDoNotSay(input.hook, banned);
  if (soft) {
    drafts = state.drafts.map((d) =>
      d.id === soft.id
        ? {
            ...d,
            title: scrubbedTitle || `${d.title} — rewritten hook`,
            hook: scrubbedHook,
            platform,
            stage: "needs-approve" as Stage,
            agent: input.agent || input.mindName,
            proactive: true,
          }
        : d,
    );
  } else {
    drafts = [
      {
        id: `dft_${crypto.randomUUID().slice(0, 8)}`,
        title: scrubbedTitle || "Proactive rewrite",
        platform,
        stage: "needs-approve",
        source: state.ingests[0]?.title ?? "proactive",
        hook: scrubbedHook,
        agent: input.agent || input.mindName,
        proactive: true,
        ingestId: state.ingests[0]?.id,
      },
      ...state.drafts,
    ];
  }

  return persist({
    ...state,
    drafts,
    timeline: pushEvents(
      state.timeline,
      event(
        "Follow-up",
        input.mindName,
        "Hook improved",
        `Updated: “${scrubbedHook.slice(0, 80)}${scrubbedHook.length > 80 ? "…" : ""}”`,
        "proactive",
      ),
    ),
  });
}

export function markSoulSyncedLive(
  userId: string,
  mindName: string,
  confirm: string,
): TenantState {
  const state = loadTenant(userId);
  return persist({
    ...state,
    timeline: pushEvents(
      state.timeline,
      event(
        "Setup",
        mindName,
        "Brand voice synced",
        confirm.slice(0, 280),
        "memory",
      ),
    ),
  });
}
