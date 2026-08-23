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

/** Gate app routes — client session (localStorage or bridge). SSR re-checks in browser. */
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
