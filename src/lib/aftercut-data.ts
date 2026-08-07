export type Platform = "shorts" | "x" | "linkedin" | "newsletter";

export const platformLabel: Record<Platform, string> = {
  shorts: "Shorts",
  x: "X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
};

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
};

export const drafts: Draft[] = [
  {
    id: "d1",
    title: "Cold open: the 3am ops story",
    platform: "shorts",
    stage: "ingested",
    source: "VOD — Aug 04 stream",
    hook: "You didn't lose the client. You lost the follow-up.",
    agent: "HOOKsmith",
  },
  {
    id: "d2",
    title: "Why one link on LinkedIn kills reach",
    platform: "linkedin",
    stage: "drafting",
    source: "VOD — Aug 04 stream",
    hook: "Same post everywhere is the cheapest way to be ignored.",
    agent: "PLATFORMFIT",
  },
  {
    id: "d3",
    title: "Thread: 6 cuts from one 90-min stream",
    platform: "x",
    stage: "drafting",
    source: "Transcript paste",
    hook: "One stream. Six platform-native cuts. Zero re-briefing.",
    agent: "PLATFORMFIT",
  },
  {
    id: "d4",
    title: "Clip 3 — rewritten hook (harder)",
    platform: "shorts",
    stage: "needs-approve",
    source: "VOD — Aug 04 stream",
    hook: "Your best take is buried at minute 41. I pulled it.",
    agent: "AFTERCUT Director",
  },
  {
    id: "d5",
    title: "Newsletter: the repurposing ledger",
    platform: "newsletter",
    stage: "needs-approve",
    source: "Telegram dump",
    hook: "What you already shipped decides what ships next.",
    agent: "QC",
  },
  {
    id: "d6",
    title: "Shorts 2 — captions locked",
    platform: "shorts",
    stage: "scheduled",
    source: "VOD — Aug 02 stream",
    hook: "Nobody is coming to repurpose this for you.",
    agent: "PLATFORMFIT",
  },
  {
    id: "d7",
    title: "X post — brand kit teaser",
    platform: "x",
    stage: "shipped",
    source: "VOD — Aug 02 stream",
    hook: "Opus clips once. AFTERCUT remembers your DNA.",
    agent: "AFTERCUT Director",
  },
  {
    id: "d8",
    title: "LinkedIn — operator POV",
    platform: "linkedin",
    stage: "shipped",
    source: "Transcript paste",
    hook: "An editor's assistant that never forgets the style guide.",
    agent: "HOOKsmith",
  },
];

export type MemoryEvent = {
  id: string;
  day: "Day 0" | "Day 1" | "Day 2";
  time: string;
  agent: string;
  title: string;
  detail: string;
  kind: "memory" | "action" | "proactive" | "denied";
};

export const timeline: MemoryEvent[] = [
  {
    id: "t1",
    day: "Day 0",
    time: "21:04",
    agent: "AFTERCUT Director",
    title: "Soul awakened",
    detail: "Brand kit stored: tone, 3 example posts, CTA set, do-not-say list.",
    kind: "memory",
  },
  {
    id: "t2",
    day: "Day 1",
    time: "23:41",
    agent: "Telegram bridge",
    title: "Long-form dump received",
    detail: "92-minute VOD transcript ingested and atomized into 14 candidate beats.",
    kind: "action",
  },
  {
    id: "t3",
    day: "Day 1",
    time: "23:58",
    agent: "PLATFORMFIT",
    title: "Platform variants drafted",
    detail: "4 Shorts scripts, 1 X thread, 1 LinkedIn post, 1 newsletter section.",
    kind: "action",
  },
  {
    id: "t4",
    day: "Day 2",
    time: "06:12",
    agent: "AFTERCUT Director",
    title: "Proactive follow-up sent",
    detail: "\"Clip 3 needs a harder hook — I rewrote it. Approve or I hold it.\"",
    kind: "proactive",
  },
  {
    id: "t5",
    day: "Day 2",
    time: "06:13",
    agent: "QC",
    title: "Duplicate blocked",
    detail: "X variant matched a shipped caption hash from Aug 02. Held for rewrite.",
    kind: "memory",
  },
  {
    id: "t6",
    day: "Day 2",
    time: "06:20",
    agent: "Publish leash",
    title: "PUBLISH DENIED",
    detail: "\"Post everything now\" rejected — no creator approval on 3 items.",
    kind: "denied",
  },
];

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
];

export const shipLedger = [
  { hash: "9f2c…41ab", platform: "X", caption: "Opus clips once…", ts: "Aug 02 · 19:20" },
  { hash: "b7d1…08ee", platform: "LinkedIn", caption: "An editor's assistant…", ts: "Aug 02 · 19:44" },
  { hash: "3ac8…77b0", platform: "Shorts", caption: "Nobody is coming…", ts: "Aug 03 · 08:05" },
];
