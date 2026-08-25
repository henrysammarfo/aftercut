const KEY = "aftercut_waitlist_v1";
const BETA_CAP = 100;

export function waitlistCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown;
    return Array.isArray(prev) ? prev.length : 0;
  } catch {
    return 0;
  }
}

export function joinCreatorWaitlist(
  email: string,
): { ok: true; count: number } | { ok: false; error: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes("@") || trimmed.length < 5) {
    return { ok: false, error: "Enter a valid email." };
  }
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown;
    const list = Array.isArray(prev) ? prev.filter((x) => typeof x === "string") : [];
    const next = [...new Set([...list, trimmed])];
    localStorage.setItem(KEY, JSON.stringify(next));
    return { ok: true, count: next.length };
  } catch {
    return { ok: false, error: "Could not save your email in this browser." };
  }
}

export const CREATOR_BETA_CAP = BETA_CAP;
