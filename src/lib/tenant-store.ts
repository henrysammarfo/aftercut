import {
  emptyBrandKit,
  emptyDrafts,
  emptyIngests,
  emptyShipLedger,
  emptyTimeline,
  platforms,
  platformLabel,
  type BrandKit,
  type Draft,
  type IngestRecord,
  type MemoryEvent,
  type Platform,
  type ShipEntry,
  type Stage,
} from "./aftercut-data";

export type TenantState = {
  userId: string;
  brandKit: BrandKit;
  drafts: Draft[];
  timeline: MemoryEvent[];
  shipLedger: ShipEntry[];
  ingests: IngestRecord[];
  /** User-editable note shown in AppShell (no fake %). */
  cognitionNote: string;
};

function key(userId: string) {
  return `aftercut_tenant_${userId}`;
}

function nowTime(): string {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
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
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).padStart(8, "0");
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
  };
}

export function loadTenant(userId: string): TenantState {
  if (typeof window === "undefined") return empty(userId);
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return empty(userId);
    const parsed = JSON.parse(raw) as TenantState;
    return {
      ...empty(userId),
      ...parsed,
      brandKit: { ...emptyBrandKit(), ...parsed.brandKit },
      drafts: parsed.drafts ?? [],
      timeline: parsed.timeline ?? [],
      shipLedger: parsed.shipLedger ?? [],
      ingests: parsed.ingests ?? [],
    };
  } catch {
    return empty(userId);
  }
}

export function saveTenant(state: TenantState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(state.userId), JSON.stringify(state));
}

function persist(state: TenantState): TenantState {
  saveTenant(state);
  return state;
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

/** Split long-form into beats from the user's own text (client-side). */
function splitBeats(text: string): string[] {
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

  return [cleaned.slice(0, 280)];
}

function agentForPlatform(platform: Platform): string {
  if (platform === "shorts" || platform === "x") return "HOOKsmith";
  if (platform === "newsletter") return "QC";
  return "PLATFORMFIT";
}

export function saveBrandKit(userId: string, kit: BrandKit): TenantState {
  const state = loadTenant(userId);
  const next: TenantState = {
    ...state,
    brandKit: {
      ...kit,
      examples: kit.examples.filter((e) => e.trim()).length
        ? kit.examples.map((e) => e.trim())
        : ["", "", ""],
      ctas: kit.ctas.map((c) => c.trim()).filter(Boolean),
      doNotSay: kit.doNotSay.map((d) => d.trim()).filter(Boolean),
    },
    timeline: [
      ...state.timeline,
      event(
        "Day 0",
        "AFTERCUT Director",
        "Soul awakened",
        `Brand kit stored for ${kit.name || "untitled"}: tone, examples, CTAs, do-not-say.`,
        "memory",
      ),
    ],
  };
  return persist(next);
}

export function setCognitionNote(userId: string, note: string): TenantState {
  const state = loadTenant(userId);
  return persist({ ...state, cognitionNote: note });
}

export function addIngest(
  userId: string,
  input: { title?: string; text: string; source?: string },
): TenantState {
  const state = loadTenant(userId);
  const text = input.text.trim();
  if (!text) return state;

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

  const next: TenantState = {
    ...state,
    ingests: [ingest, ...state.ingests],
    timeline: [
      ...state.timeline,
      event(
        "Day 1",
        "Ingest",
        "Long-form dump received",
        `${ingest.source}: "${ingest.title}" queued for the Circle.`,
        "action",
      ),
    ],
  };
  return persist(next);
}

export function atomizeIngest(userId: string, ingestId?: string): TenantState {
  const state = loadTenant(userId);
  const target =
    (ingestId ? state.ingests.find((i) => i.id === ingestId) : null) ??
    state.ingests.find((i) => i.status === "queued") ??
    state.ingests[0];

  if (!target) return state;

  const beats = splitBeats(target.text);
  const toneHint = state.brandKit.tone.trim();
  const cta = state.brandKit.ctas[0] ?? "";
  const newDrafts: Draft[] = [];

  beats.forEach((beat, i) => {
    const platform = platforms[i % platforms.length]!;
    const hookBase = beat.slice(0, 120).trim();
    const hook =
      toneHint && !hookBase.toLowerCase().includes(toneHint.slice(0, 12).toLowerCase())
        ? hookBase
        : hookBase;
    const stage: Stage = i % 3 === 0 ? "needs-approve" : "drafting";
    newDrafts.push({
      id: `dft_${crypto.randomUUID().slice(0, 8)}`,
      title: `${platformLabel[platform]} cut ${i + 1}`,
      platform,
      stage,
      source: target.title,
      hook: cta ? `${hook}${hook.endsWith(".") ? "" : "."} ${cta}` : hook,
      agent: agentForPlatform(platform),
    });
  });

  // Also leave a source card in ingested
  newDrafts.unshift({
    id: `dft_${crypto.randomUUID().slice(0, 8)}`,
    title: target.title,
    platform: "shorts",
    stage: "ingested",
    source: target.source,
    hook: beats[0]?.slice(0, 100) || "Raw long-form waiting for cuts.",
    agent: "AFTERCUT Director",
  });

  const ingests = state.ingests.map((i) =>
    i.id === target.id
      ? { ...i, status: "atomized" as const, beatCount: beats.length }
      : i,
  );

  const next: TenantState = {
    ...state,
    ingests,
    drafts: [...newDrafts, ...state.drafts],
    timeline: [
      ...state.timeline,
      event(
        "Day 1",
        "PLATFORMFIT",
        "Platform variants drafted",
        `${beats.length} beat(s) → ${newDrafts.length - 1} platform draft(s) from your content.`,
        "action",
      ),
    ],
  };
  return persist(next);
}

export function setDraftStage(userId: string, draftId: string, stage: Stage): TenantState {
  const state = loadTenant(userId);
  const drafts = state.drafts.map((d) => (d.id === draftId ? { ...d, stage } : d));
  let shipLedger = state.shipLedger;
  let timeline = state.timeline;

  const draft = state.drafts.find((d) => d.id === draftId);
  if (draft && stage === "shipped") {
    const caption = draft.hook;
    const entry: ShipEntry = {
      hash: shortHash(`${draft.platform}|${caption}|${Date.now()}`),
      platform: platformLabel[draft.platform],
      caption: caption.slice(0, 40) + (caption.length > 40 ? "…" : ""),
      ts: nowTs(),
    };
    shipLedger = [entry, ...shipLedger];
    timeline = [
      ...timeline,
      event(
        "Day 2",
        "QC",
        "Shipped to ledger",
        `${entry.platform} · ${entry.hash} remembered.`,
        "memory",
      ),
    ];
  }

  return persist({ ...state, drafts, shipLedger, timeline });
}

export function approveDraft(userId: string, draftId: string): TenantState {
  return setDraftStage(userId, draftId, "scheduled");
}

export function rejectDraft(userId: string, draftId: string): TenantState {
  const state = loadTenant(userId);
  const draft = state.drafts.find((d) => d.id === draftId);
  const next = setDraftStage(userId, draftId, "drafting");
  if (!draft) return next;
  return persist({
    ...next,
    timeline: [
      ...next.timeline,
      event(
        "Day 2",
        "AFTERCUT Director",
        "Draft rejected",
        `"${draft.title}" sent back to drafting.`,
        "action",
      ),
    ],
  });
}

export function denyPublishAll(userId: string): TenantState {
  const state = loadTenant(userId);
  const pending = state.drafts.filter(
    (d) => d.stage === "needs-approve" || d.stage === "drafting" || d.stage === "ingested",
  ).length;
  return persist({
    ...state,
    timeline: [
      ...state.timeline,
      event(
        "Day 2",
        "Publish leash",
        "PUBLISH DENIED",
        `"Post everything now" rejected — ${pending} item(s) lack creator approval.`,
        "denied",
      ),
    ],
  });
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
  return persist({ ...state, timeline: [...state.timeline, evt] });
}

/** Only runs when brand kit + at least one ingest exist — proactive event from THEIR data. */
export function simulateDay2Followup(userId: string): TenantState {
  const state = loadTenant(userId);
  const hasKit = Boolean(state.brandKit.name.trim() || state.brandKit.tone.trim());
  const hasIngest = state.ingests.length > 0;
  if (!hasKit || !hasIngest) return state;

  const draft =
    state.drafts.find((d) => d.stage === "needs-approve" || d.stage === "drafting") ??
    state.drafts[0];
  const label = draft?.title ?? state.ingests[0]!.title;
  const rewriteHook = draft
    ? `${draft.hook.replace(/\.$/, "")} — harder open, still in your voice.`
    : `Harder hook for ${label}, still matching ${state.brandKit.name || "your kit"}.`;

  let drafts = state.drafts;
  if (draft) {
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
  }

  return persist({
    ...state,
    drafts,
    timeline: [
      ...state.timeline,
      event(
        "Day 2",
        "AFTERCUT Director",
        "Proactive follow-up sent",
        `"${label}" needs a harder hook — I rewrote it from your ${state.brandKit.name || "brand"} kit. Approve or I hold it.`,
        "proactive",
      ),
    ],
  });
}
