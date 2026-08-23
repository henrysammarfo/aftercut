import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth-store";
import { getBridgeSession } from "./session-bridge";

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

function clientRedirect(nextPath?: string): never {
  const next =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : typeof window !== "undefined"
        ? window.location.pathname
        : "/onboarding";
  throw redirect({ to: "/login", search: { next } });
}

/**
 * Gate app routes from the client. Local auth uses localStorage; cloud auth
 * session cookies are enforced by API handlers — this file must stay free of
 * server-only imports so Vite does not pull @tanstack/react-start/server
 * into the client bundle.
 */
export async function requireAuth(nextPath?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (!session) clientRedirect(nextPath);
}

/** Marketing auth pages — bounce signed-in users to app. */
export async function redirectIfAuthed(to: "/onboarding" | "/dashboard" = "/onboarding"): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (session) throw redirect({ to });
}
