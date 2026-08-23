/**
 * Social publish — real provider APIs (OAuth tokens from Settings).
 * X API v2: https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 * LinkedIn UGC: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api
 */

import { and, eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getDb, hasDatabase, schema } from "@/db";
import { getAuth, cloudAuthEnabled } from "@/lib/auth-server";
import { sendShipReceiptEmail } from "@/lib/email";
import { recordPublishEvent } from "@/lib/tenant-db";
import { getProviderToken } from "@/lib/social/tokens";

async function requireUser() {
  if (!cloudAuthEnabled()) throw new Error("Cloud auth required.");
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user?.id) throw new Error("Sign in to continue.");
  return { id: session.user.id, email: session.user.email };
}

async function getToken(userId: string, provider: "x" | "linkedin") {
  return getProviderToken(userId, provider);
}

export const publishToX = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const user = await requireUser();
  const { text, draftId, brandId } = (ctx as { data?: { text: string; draftId?: string; brandId?: string } }).data ?? ctx as { text: string; draftId?: string; brandId?: string };
  const token = await getToken(user.id, "x");
  if (!token) return { ok: false as const, error: "Connect your X account in Settings first." };

  const res = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text.slice(0, 280) }),
  });
  const json = (await res.json()) as { data?: { id?: string }; detail?: string };
  if (!res.ok) {
    return { ok: false as const, error: json.detail ?? `X API error ${res.status}` };
  }
  await recordPublishEvent({
    userId: user.id,
    brandId,
    draftId,
    platform: "x",
    hook: text.slice(0, 280),
    externalId: json.data?.id,
  });
  if (user.email) {
    void sendShipReceiptEmail({
      to: user.email,
      platform: "x",
      hook: text,
      externalId: json.data?.id,
    });
  }
  return { ok: true as const, id: json.data?.id };
});

export const publishToLinkedIn = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const user = await requireUser();
  const { text, draftId, brandId } = (ctx as { data?: { text: string; draftId?: string; brandId?: string } }).data ?? ctx as { text: string; draftId?: string; brandId?: string };
  const token = await getToken(user.id, "linkedin");
  if (!token) return { ok: false as const, error: "Connect LinkedIn in Settings first." };

  const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) return { ok: false as const, error: "LinkedIn token invalid — reconnect in Settings." };
  const me = (await meRes.json()) as { sub?: string };
  const author = `urn:li:person:${me.sub}`;

  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: text.slice(0, 3000) },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  const id = res.headers.get("x-restli-id") ?? undefined;
  if (!res.ok) {
    const errText = await res.text();
    return { ok: false as const, error: errText.slice(0, 200) || `LinkedIn error ${res.status}` };
  }
  await recordPublishEvent({
    userId: user.id,
    brandId,
    draftId,
    platform: "linkedin",
    hook: text.slice(0, 300),
    externalId: id,
  });
  if (user.email) {
    void sendShipReceiptEmail({
      to: user.email,
      platform: "linkedin",
      hook: text,
      externalId: id,
    });
  }
  return { ok: true as const, id };
});

export const saveConnectedAccount = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const user = await requireUser();
  if (!hasDatabase()) throw new Error("Database required.");
  const input = (ctx as { data?: { provider: string; accessToken: string; refreshToken?: string; scope?: string } }).data ?? ctx as { provider: string; accessToken: string; refreshToken?: string; scope?: string };
  const db = getDb();
  const id = `conn_${crypto.randomUUID().slice(0, 12)}`;
  const existing = await db
    .select()
    .from(schema.connectedAccount)
    .where(
      and(
        eq(schema.connectedAccount.userId, user.id),
        eq(schema.connectedAccount.provider, input.provider),
      ),
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(schema.connectedAccount)
      .set({
        accessToken: input.accessToken,
        refreshToken: input.refreshToken ?? null,
        scope: input.scope ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.connectedAccount.id, existing[0].id));
  } else {
    await db.insert(schema.connectedAccount).values({
      id,
      userId: user.id,
      provider: input.provider,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      scope: input.scope ?? null,
    });
  }
  return { ok: true as const };
});

export const fetchPublishAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const { publishAnalytics } = await import("@/lib/tenant-db");
  const rows = await publishAnalytics(user.id, 30);
  return rows.map((r) => ({
    platform: r.platform,
    hook: r.hook,
    publishedAt: r.publishedAt?.toISOString(),
    externalId: r.externalId,
  }));
});
