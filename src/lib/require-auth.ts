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

/** Gate app routes — client + server (Better Auth cookies). */
export async function requireAuth(nextPath?: string): Promise<void> {
  if (typeof window !== "undefined") {
    const session = getBridgeSession() ?? getSession();
    if (!session) clientRedirect(nextPath);
    return;
  }

  try {
    const { cloudAuthEnabled, getAuth } = await import("./auth-server");
    if (!cloudAuthEnabled()) return;
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
    if (!session?.user?.id) {
      throw redirect({ to: "/login" });
    }
  } catch (e) {
    if (e && typeof e === "object" && "isRedirect" in e) throw e;
    throw redirect({ to: "/login" });
  }
}

/** Marketing auth pages — bounce signed-in users to app. */
export async function redirectIfAuthed(to: "/onboarding" | "/dashboard" = "/onboarding"): Promise<void> {
  if (typeof window !== "undefined") {
    const session = getBridgeSession() ?? getSession();
    if (session) throw redirect({ to });
    return;
  }
  try {
    const { cloudAuthEnabled, getAuth } = await import("./auth-server");
    if (!cloudAuthEnabled()) return;
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
    if (session?.user?.id) throw redirect({ to });
  } catch (e) {
    if (e && typeof e === "object" && "isRedirect" in e) throw e;
  }
}
