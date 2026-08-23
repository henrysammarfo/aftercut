/**
 * Cloud tenant mutations — Postgres-backed, session-gated.
 */

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { hasDatabase } from "@/db";
import { getAuth } from "@/lib/auth-server";
import type { BrandKit, Stage } from "@/lib/aftercut-data";
import {
  addIngest,
  applyLiveAtomize,
  applyLiveProactive,
  approveDraft,
  denyPublishAll,
  exportTenantJson,
  importTenantJson,
  markSoulSyncedLive,
  primeServerTenant,
  rejectDraft,
  saveBrandKit,
  setCognitionNote,
  setDraftStage,
  takeServerTenant,
  type TenantState,
} from "@/lib/tenant-store";
import {
  loadBrandTenant,
  saveBrandTenant,
  ensureDefaultBrand,
  listBrands,
  createBrand,
  switchBrand,
  listStudioInvites,
  createStudioInvite,
} from "@/lib/tenant-db";
import { sendInviteEmail } from "@/lib/email";

async function requireUserId(): Promise<string> {
  if (!hasDatabase()) throw new Error("Cloud storage is not configured.");
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user?.id) throw new Error("Sign in to continue.");
  return session.user.id;
}

async function withBrandMutation<T>(
  userId: string,
  brandId: string | undefined,
  mutate: (uid: string) => T,
): Promise<{ result: T; state: TenantState; brandId: string }> {
  const loaded = await loadBrandTenant(userId, brandId);
  primeServerTenant(loaded.state);
  const result = mutate(userId);
  const state =
    takeServerTenant(userId) ??
    ({
      ...loaded.state,
      updatedAt: new Date().toISOString(),
    } as TenantState);
  await saveBrandTenant(userId, loaded.brandId, state);
  return { result, state, brandId: loaded.brandId };
}

export const fetchProductConfig = createServerFn({ method: "GET" }).handler(async () => ({
  cloudAuth: hasDatabase() && Boolean(process.env.BETTER_AUTH_SECRET?.trim()),
  cloudStorage: hasDatabase(),
}));

export const fetchCloudTenant = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  await ensureDefaultBrand(userId);
  const loaded = await loadBrandTenant(userId);
  return loaded;
});

export const cloudSaveBrandKit = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { kit, brandId } = (ctx.data ?? ctx) as { kit: BrandKit; brandId?: string };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    saveBrandKit(uid, kit),
  );
  return { ...result, state };
});

export const cloudSetCognitionNote = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { note, brandId } = (ctx.data ?? ctx) as { note: string; brandId?: string };
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    setCognitionNote(uid, note);
    return { ok: true as const };
  });
  return { ok: true as const, state };
});

export const cloudAddIngest = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const input = (ctx.data ?? ctx) as {
    title?: string;
    text: string;
    source?: string;
    brandId?: string;
  };
  const { result, state } = await withBrandMutation(userId, input.brandId, (uid) =>
    addIngest(uid, input),
  );
  return { ...result, state };
});

export const cloudSetDraftStage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { draftId, stage, brandId } = (ctx.data ?? ctx) as {
    draftId: string;
    stage: Stage;
    brandId?: string;
  };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    setDraftStage(uid, draftId, stage),
  );
  return { ...result, state };
});

export const cloudApproveDraft = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { draftId, brandId } = (ctx.data ?? ctx) as { draftId: string; brandId?: string };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    approveDraft(uid, draftId),
  );
  return { ...result, state };
});

export const cloudRejectDraft = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { draftId, brandId } = (ctx.data ?? ctx) as { draftId: string; brandId?: string };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    rejectDraft(uid, draftId),
  );
  return { ...result, state };
});

export const cloudDenyPublishAll = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { brandId } = (ctx.data ?? ctx) as { brandId?: string };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) => denyPublishAll(uid));
  return { detail: result.detail, state };
});

export const cloudApplyLiveAtomize = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const input = (ctx.data ?? ctx) as Parameters<typeof applyLiveAtomize>[1] & { brandId?: string };
  const { brandId, ...atomizeInput } = input;
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    applyLiveAtomize(uid, atomizeInput);
    return { ok: true as const };
  });
  return { ok: true as const, state };
});

export const cloudApplyLiveProactive = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const input = (ctx.data ?? ctx) as Parameters<typeof applyLiveProactive>[1] & { brandId?: string };
  const { brandId, ...proactiveInput } = input;
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    applyLiveProactive(uid, proactiveInput);
    return { ok: true as const };
  });
  return { ok: true as const, state };
});

export const cloudMarkSoulSynced = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { mindName, confirm, brandId } = (ctx.data ?? ctx) as {
    mindName: string;
    confirm: string;
    brandId?: string;
  };
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    markSoulSyncedLive(uid, mindName, confirm);
    return { ok: true as const };
  });
  return { ok: true as const, state };
});

export const cloudExportTenant = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const loaded = await loadBrandTenant(userId);
  primeServerTenant(loaded.state);
  const json = exportTenantJson(userId);
  takeServerTenant(userId);
  return { json };
});

export const cloudImportTenant = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { json, brandId } = (ctx.data ?? ctx) as { json: string; brandId?: string };
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    importTenantJson(uid, json),
  );
  return { ...result, state };
});

export const migrateLocalTenant = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { json } = (ctx.data ?? ctx) as { json: string };
  const loaded = await loadBrandTenant(userId);
  if (loaded.state.drafts.length > 0 || loaded.state.ingests.length > 0) {
    return { ok: false as const, error: "Cloud workspace already has data." };
  }
  primeServerTenant(loaded.state);
  const res = importTenantJson(userId, json);
  const state = takeServerTenant(userId);
  if (res.ok && state) {
    await saveBrandTenant(userId, loaded.brandId, state);
  }
  return res.ok ? { ok: true as const, state: state! } : { ok: false as const, error: res.message };
});

export const fetchBrands = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  await ensureDefaultBrand(userId);
  const rows = await listBrands(userId);
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    isDefault: b.isDefault,
  }));
});

export const cloudCreateBrand = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { name } = (ctx.data ?? ctx) as { name: string };
  const row = await createBrand(userId, name);
  const loaded = await loadBrandTenant(userId, row.id);
  return {
    ok: true as const,
    brand: { id: row.id, name: row.name, slug: row.slug, isDefault: true },
    state: loaded.state,
  };
});

export const cloudSwitchBrand = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { brandId } = (ctx.data ?? ctx) as { brandId: string };
  const loaded = await switchBrand(userId, brandId);
  return {
    ok: true as const,
    brandId: loaded.brandId,
    brandName: loaded.brandName,
    state: loaded.state,
  };
});

export const fetchEmailStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { resendConfigured } = await import("@/lib/email");
  return { resendConfigured: resendConfigured() };
});

export const fetchStudioInvites = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const rows = await listStudioInvites(userId);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    status: r.status,
    createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
  }));
});

export const cloudInviteStudioMember = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { email, role } = (ctx.data ?? ctx) as { email: string; role?: string };
  const row = await createStudioInvite(userId, email, role ?? "editor");
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });
  const inviter = session?.user?.name || session?.user?.email || "A creator";
  const base =
    process.env.BETTER_AUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://aftercut-sandy.vercel.app");
  const mail = await sendInviteEmail(row.email, inviter, `${base.replace(/\/$/, "")}/signup`);
  return {
    ok: true as const,
    invite: {
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
    },
    emailed: mail.ok,
    emailError: mail.ok ? undefined : mail.error,
  };
});
