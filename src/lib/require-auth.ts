import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth-store";
import { getBridgeSession } from "./session-bridge";

/**
 * Client-safe route gate. Do NOT import `@tanstack/react-start/server` or
 * `auth-server` here — Vite import-protection will break the client bundle
 * (film/demo crash on /onboarding).
 *
 * Server mutations already enforce session via createServerFn handlers.
 */

const APP_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/brand-kit",
  "/ingest",
  "/studio",
  "/timeline",
  "/circle",
  "/settings",
  "/merch",
];

export function isAppRoute(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function safeNext(nextPath?: string): string {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) return nextPath;
  if (typeof window !== "undefined") return window.location.pathname;
  return "/onboarding";
}

/** Gate app routes on the client (and no-op during SSR). */
export async function requireAuth(nextPath?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { next: safeNext(nextPath) },
    });
  }
}

/** Marketing auth pages — bounce signed-in users into the app. */
export async function redirectIfAuthed(to: "/onboarding" | "/dashboard" = "/onboarding"): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (session) throw redirect({ to });
}
