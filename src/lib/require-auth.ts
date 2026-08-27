import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth-store";
import { getBridgeSession } from "./session-bridge";
import { assertAuthedServer } from "./assert-authed";

/**
 * Dual gate: server Better Auth (cloud) + client bridge/localStorage.
 * Do NOT import `auth-server` here directly — use assertAuthedServer createServerFn.
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

/** Gate app routes — server session in cloud, client session always. */
export async function requireAuth(nextPath?: string): Promise<void> {
  const next = safeNext(nextPath);
  try {
    await assertAuthedServer({ data: { next } });
  } catch (e) {
    // redirect throws; rethrow. Other errors fall through to client gate.
    if (e && typeof e === "object" && "to" in e) throw e;
  }
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { next },
    });
  }
}

/** Marketing auth pages — bounce signed-in users into the app. */
export async function redirectIfAuthed(to: "/onboarding" | "/dashboard" = "/onboarding"): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (session) throw redirect({ to });
}

/** Marketing auth pages — bounce signed-in users into the app. */
export async function redirectIfAuthed(to: "/onboarding" | "/dashboard" = "/onboarding"): Promise<void> {
  if (typeof window === "undefined") return;
  const session = getBridgeSession() ?? getSession();
  if (session) throw redirect({ to });
}
