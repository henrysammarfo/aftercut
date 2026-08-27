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
  markDay2Reopen,
  markSoulSyncedLive,
  primeServerTenant,
  rejectDraft,
  saveBrandKit,
  setCognitionNote,
  setDraftStage,
  takeServerTenant,
  saveIntegrations,
  type TenantState,
} from "@/lib/tenant-store";
import type { TenantIntegrations } from "@/lib/aftercut-data";
import { persistCreatorWaitlist } from "@/lib/waitlist-db";
import { extractYoutubeUrl, formatYoutubeBrief } from "@/lib/media-ingest";
import { fetchYoutubeOembed } from "@/lib/youtube-oembed";
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
import { sendInviteEmail, sendOvernightHookEmail, sendCognitionLowEmail, sendWaitlistEmail } from "@/lib/email";
import { inviteEmailSchema, ingestSchema, parseOrError, emailSchema } from "@/lib/validation";

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

export const cloudSaveIntegrations = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const raw = (ctx.data ?? ctx) as TenantIntegrations & { brandId?: string };
  const { brandId, ...patch } = raw;
  const { result, state } = await withBrandMutation(userId, brandId, (uid) =>
    saveIntegrations(uid, patch),
  );
  if (result.ok && patch.telegramChatId?.trim() && hasDatabase()) {
    const db = (await import("@/db")).getDb();
    const schema = (await import("@/db")).schema;
    const { and, eq } = await import("drizzle-orm");
    const chatId = patch.telegramChatId.trim();
    const existing = await db
      .select()
      .from(schema.connectedAccount)
      .where(
        and(
          eq(schema.connectedAccount.userId, userId),
          eq(schema.connectedAccount.provider, "telegram"),
        ),
      )
      .limit(1);
    if (existing[0]) {
      await db
        .update(schema.connectedAccount)
        .set({
          providerAccountId: chatId,
          updatedAt: new Date(),
        })
        .where(eq(schema.connectedAccount.id, existing[0].id));
    } else {
      await db.insert(schema.connectedAccount).values({
        id: `conn_${crypto.randomUUID().slice(0, 12)}`,
        userId,
        provider: "telegram",
        providerAccountId: chatId,
        accessToken: null,
      });
    }
  }
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
  const raw = (ctx.data ?? ctx) as {
    title?: string;
    text: string;
    source?: string;
    media?: import("./aftercut-data").IngestMedia;
    brandId?: string;
  };
  const parsed = parseOrError(ingestSchema, raw);
  if (!parsed.ok) throw new Error(parsed.error);
  const input = { ...parsed.data, brandId: raw.brandId };
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

export const cloudMarkDay2Reopen = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { mindName, brandId } = (ctx.data ?? ctx) as { mindName?: string; brandId?: string };
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    markDay2Reopen(uid, mindName);
    return { ok: true as const };
  });
  return { ok: true as const, state };
});

export const cloudYoutubeNotes = createServerFn({ method: "POST" }).handler(async (ctx) => {
  await requireUserId();
  const raw = (ctx.data ?? ctx) as { text?: string };
  const text = typeof raw.text === "string" ? raw.text : "";
  const url = extractYoutubeUrl(text);
  if (!url) return { ok: false as const, error: "Paste a YouTube URL." };
  const meta = await fetchYoutubeOembed(url);
  const brief = formatYoutubeBrief(meta, text);
  const title = meta.title?.trim() || undefined;
  return { ok: true as const, brief, title, url };
});

export const cloudApplyLiveProactive = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });
  const input = (ctx.data ?? ctx) as Parameters<typeof applyLiveProactive>[1] & { brandId?: string };
  const { brandId, ...proactiveInput } = input;
  const { state } = await withBrandMutation(userId, brandId, (uid) => {
    applyLiveProactive(uid, proactiveInput);
    return { ok: true as const };
  });
  const email = session?.user?.email;
  if (email && proactiveInput.hook) {
    void sendOvernightHookEmail({
      to: email,
      title: proactiveInput.title,
      hook: proactiveInput.hook,
      platform: proactiveInput.platform,
    });
  }
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
  const raw = (ctx.data ?? ctx) as { email: string; role?: string };
  const parsed = parseOrError(inviteEmailSchema, raw.email);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };
  const email = parsed.data;
  const role = raw.role?.trim() === "admin" ? "admin" : "editor";
  const row = await createStudioInvite(userId, email, role);
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

/** Once-per-day cognition critical alert (client debounce + server send). */
export const notifyCognitionLow = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const { cognition } = (ctx.data ?? ctx) as { cognition: number };
  const headers = getRequestHeaders();
  const session = await getAuth().api.getSession({ headers });
  const email = session?.user?.email;
  if (!email) return { ok: false as const, error: "No email on account." };
  const mail = await sendCognitionLowEmail(email, cognition);
  return mail.ok
    ? { ok: true as const, id: mail.id }
    : { ok: false as const, error: mail.error };
});

/** Public first-100 waitlist — Neon list + optional Resend confirm. */
export const cloudJoinWaitlist = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const raw = (ctx.data ?? ctx) as { email?: string };
  const parsed = parseOrError(emailSchema, raw.email);
  if (!parsed.ok) return { ok: false as const, error: parsed.error };
  const stored = await persistCreatorWaitlist(parsed.data);
  const mail = await sendWaitlistEmail(parsed.data);
  return {
    ok: true as const,
    saved: stored.saved,
    duplicate: stored.duplicate,
    emailed: mail.ok,
    emailError: mail.ok ? undefined : mail.error,
  };
});
