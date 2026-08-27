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
  { id: "ingested", label: "New" },
  { id: "drafting", label: "Drafting" },
  { id: "needs-approve", label: "Needs approval" },
  { id: "scheduled", label: "Scheduled" },
  { id: "shipped", label: "Published" },
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
  day: "Setup" | "Content" | "Follow-up";
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
  /** Visual DNA — logo data URL (compressed), hex colors, fonts */
  logoDataUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
  visualNotes?: string;
};

export type TenantIntegrations = {
  /** hellominds Mind UUID linked to this creator */
  mindId?: string;
  /** Telegram chat id string for webhook routing */
  telegramChatId?: string;
  telegramUsername?: string;
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

export type IngestMedia = {
  kind: "image" | "video";
  filename: string;
  mime: string;
  size: number;
  durationSec?: number;
  width?: number;
  height?: number;
  /** Compressed JPEG still — never the full video file. */
  posterDataUrl?: string;
};

export type IngestRecord = {
  id: string;
  title: string;
  text: string;
  source: string;
  createdAt: string;
  status: "queued" | "atomized";
  beatCount: number;
  media?: IngestMedia;
};

export function emptyBrandKit(): BrandKit {
  return {
    name: "",
    tone: "",
    examples: ["", "", ""],
    ctas: [],
    doNotSay: [],
    primaryPlatform: "",
    logoDataUrl: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    fontHeading: "",
    fontBody: "",
    visualNotes: "",
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

/** Specialist roles on the AFTERCUT agent team. */
export const circle = [
  {
    name: "AFTERCUT Director",
    displayName: "Lead agent",
    role: "Lead agent",
    duty: "Remembers your brand, runs digests, and handles approvals and follow-ups.",
  },
  {
    name: "HOOKsmith",
    displayName: "Hooks specialist",
    role: "Hooks specialist",
    duty: "Opens and CTAs only — rewrites weak first lines until they land.",
  },
  {
    name: "PLATFORMFIT",
    displayName: "Platform specialist",
    role: "Platform specialist",
    duty: "Shorts, X, LinkedIn and newsletter — each with native length and voice.",
  },
  {
    name: "QC",
    displayName: "Quality check",
    role: "Quality check",
    duty: "Blocks spam and duplicate posts using your publish history.",
  },
] as const;
