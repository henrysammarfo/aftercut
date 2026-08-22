import type { Session } from "./auth-store";

/** Unified session for route guards — local or Better Auth. */
let bridge: Session | null = null;

export function setBridgeSession(session: Session | null) {
  bridge = session;
}

export function getBridgeSession(): Session | null {
  return bridge;
}
