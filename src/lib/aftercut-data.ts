/** Product types + static Circle architecture. No mock user seed data. */

export type Platform = "shorts" | "x" | "linkedin" | "newsletter";

export const platformLabel: Record<Platform, string> = {
  shorts: "Shorts",
  x: "X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
};

export const platforms: Platform[] = ["shorts", "x", "linkedin", "newsletter"];

export type Stage = "ingested" | "drafting" | "needs-approve" | "scheduled" | "shipped";

export const stages: { id: Stage; label: string }[] = [
  { id: "ingested", label: "Ingested" },
  { id: "drafting", label: "Drafting" },
  { id: "needs-approve", label: "Needs approve" },
  { id: "scheduled", label: "Scheduled" },
  { id: "shipped", label: "Shipped" },
];

export type Draft = {
  id: string;
  title: string;
  platform: Platform;
  stage: Stage;
  source: string;
  hook: string;
  agent: string;
  /** True when Director rewrote this card on Day 2 simulate. */
  proactive?: boolean;
  /** Ingest id that produced this draft (for re-atomize replace). */
  ingestId?: string;
};

export type MemoryEvent = {
  id: string;
  day: "Day 0" | "Day 1" | "Day 2";
  time: string;
  agent: string;
  title: string;
  detail: string;
  kind: "memory" | "action" | "proactive" | "denied";
};

export type BrandKit = {
  name: string;
  tone: string;
  examples: string[];
  ctas: string[];
  doNotSay: string[];
  primaryPlatform?: string;
};

export type ShipEntry = {
  hash: string;
  /** Stable compare key = normalizeCaption(full hook). Prefer this over caption preview. */
  fingerprint?: string;
  platform: string;
  /** Short display preview only — not used for dupe match when fingerprint set. */
  caption: string;
  ts: string;
};

export type IngestRecord = {
  id: string;
  title: string;
  text: string;
  source: string;
  createdAt: string;
  status: "queued" | "atomized";
  beatCount: number;
};

export function emptyBrandKit(): BrandKit {
  return {
    name: "",
    tone: "",
    examples: ["", "", ""],
    ctas: [],
    doNotSay: [],
    primaryPlatform: "",
  };
}

export function emptyDrafts(): Draft[] {
  return [];
}

export function emptyTimeline(): MemoryEvent[] {
  return [];
}

export function emptyShipLedger(): ShipEntry[] {
  return [];
}

export function emptyIngests(): IngestRecord[] {
  return [];
}

/** Static product truth — the 4 Mind roles (architecture, not mock user data). */
export const circle = [
  {
    name: "AFTERCUT Director",
    role: "Primary Mind · cognition boost",
    duty: "Holds creative DNA, runs digests, owns approve / reject and follow-up.",
  },
  {
    name: "HOOKsmith",
    role: "Circle agent",
    duty: "Hooks and CTAs only. Rewrites weak openings until they land.",
  },
  {
    name: "PLATFORMFIT",
    role: "Circle agent",
    duty: "Shorts vs X vs LinkedIn vs newsletter voice, length and pacing.",
  },
  {
    name: "QC",
    role: "Circle agent",
    duty: "Spam and duplicate checks against the shipped ledger memory.",
  },
] as const;
