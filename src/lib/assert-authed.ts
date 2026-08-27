/**
 * Session-gated route assert — createServerFn only (safe for route beforeLoad).
 * Do not export plain helpers that call getRequestHeaders from this file.
 */

import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { hasDatabase } from "@/db";
import { getAuth } from "@/lib/auth-server";

export type AuthedUser = { userId: string; email: string | null; name: string | null };

/**
 * Server assert for protected app routes. Throws redirect to /login when unsigned.
 * Cloud mode: real Better Auth session. Local-only mode: allows through (client gate still applies).
 */
export const assertAuthedServer = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const next =
      data && typeof data === "object" && "next" in data
        ? String((data as { next?: unknown }).next ?? "/onboarding")
        : "/onboarding";
    return {
      next: next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding",
    };
  })
  .handler(async ({ data }): Promise<AuthedUser | { skipped: true }> => {
    const safeNext = data.next;

    if (!hasDatabase() || !process.env["BETTER_AUTH_SECRET"]?.trim()) {
      return { skipped: true };
    }

    const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
    if (!session?.user?.id) {
      throw redirect({
        to: "/login",
        search: { next: safeNext },
      });
    }
    return {
      userId: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
    };
  });
