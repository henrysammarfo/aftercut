import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth-store";
import { getBridgeSession } from "./session-bridge";

/** Client-side gate for app routes — marketing pages stay public. */
export function requireAuth() {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { next: window.location.pathname },
    });
  }
}
