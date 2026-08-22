import { and, desc, eq } from "drizzle-orm";

import { getDb, hasDatabase, schema } from "@/db";
import type { TenantState } from "@/lib/tenant-store";
import { emptyBrandKit, emptyDrafts, emptyIngests, emptyShipLedger, emptyTimeline } from "@/lib/aftercut-data";

function emptyTenant(userId: string): TenantState {
  return {
    userId,
    brandKit: emptyBrandKit(),
    drafts: emptyDrafts(),
    timeline: emptyTimeline(),
    shipLedger: emptyShipLedger(),
    ingests: emptyIngests(),
    cognitionNote: "",
    updatedAt: new Date().toISOString(),
  };
}

function parseTenant(userId: string, raw: unknown): TenantState {
  const base = emptyTenant(userId);
  if (!raw || typeof raw !== "object") return base;
  const parsed = raw as Partial<TenantState>;
  return {
    ...base,
    ...parsed,
    userId,
    brandKit: { ...base.brandKit, ...(parsed.brandKit ?? {}) },
    drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
    timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
    shipLedger: Array.isArray(parsed.shipLedger) ? parsed.shipLedger : [],
    ingests: Array.isArray(parsed.ingests) ? parsed.ingests : [],
    cognitionNote: parsed.cognitionNote ?? "",
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export async function ensureDefaultBrand(userId: string, displayName?: string) {
  if (!hasDatabase()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.brand)
    .where(and(eq(schema.brand.userId, userId), eq(schema.brand.isDefault, true)))
    .limit(1);
  const existing = rows[0];
  if (existing) return existing;

  const id = `br_${crypto.randomUUID().slice(0, 12)}`;
  const name = displayName?.trim() || "My brand";
  const slug = "default";
  const row = {
    id,
    userId,
    name,
    slug,
    isDefault: true,
    data: emptyTenant(userId),
  };
  await db.insert(schema.brand).values(row);
  return row;
}

export async function loadBrandTenant(userId: string, brandId?: string): Promise<{
  brandId: string;
  brandName: string;
  state: TenantState;
}> {
  if (!hasDatabase()) {
    const state = emptyTenant(userId);
    return { brandId: "local", brandName: "Local", state };
  }
  const db = getDb();
  let row;
  if (brandId) {
    const rows = await db
      .select()
      .from(schema.brand)
      .where(and(eq(schema.brand.userId, userId), eq(schema.brand.id, brandId)))
      .limit(1);
    row = rows[0];
  } else {
    const rows = await db
      .select()
      .from(schema.brand)
      .where(and(eq(schema.brand.userId, userId), eq(schema.brand.isDefault, true)))
      .limit(1);
    row = rows[0];
  }

  if (!row) {
    const created = await ensureDefaultBrand(userId);
    const state = emptyTenant(userId);
    return {
      brandId: created!.id,
      brandName: created!.name,
      state,
    };
  }

  return {
    brandId: row.id,
    brandName: row.name,
    state: parseTenant(userId, row.data),
  };
}

export async function saveBrandTenant(userId: string, brandId: string, state: TenantState) {
  if (!hasDatabase()) return;
  const db = getDb();
  await db
    .update(schema.brand)
    .set({
      data: { ...state, userId, updatedAt: new Date().toISOString() },
      updatedAt: new Date(),
    })
    .where(and(eq(schema.brand.userId, userId), eq(schema.brand.id, brandId)));
}

export async function listBrands(userId: string) {
  if (!hasDatabase()) return [];
  const db = getDb();
  return db.select().from(schema.brand).where(eq(schema.brand.userId, userId));
}

export async function recordPublishEvent(input: {
  userId: string;
  brandId?: string;
  draftId?: string;
  platform: string;
  hook?: string;
  externalId?: string;
  meta?: Record<string, unknown>;
}) {
  if (!hasDatabase()) return;
  const db = getDb();
  await db.insert(schema.publishEvent).values({
    id: `pub_${crypto.randomUUID().slice(0, 12)}`,
    userId: input.userId,
    brandId: input.brandId ?? null,
    draftId: input.draftId ?? null,
    platform: input.platform,
    hook: input.hook ?? null,
    externalId: input.externalId ?? null,
    meta: input.meta ?? {},
  });
}

export async function publishAnalytics(userId: string, limit = 50) {
  if (!hasDatabase()) return [];
  const db = getDb();
  return db
    .select()
    .from(schema.publishEvent)
    .where(eq(schema.publishEvent.userId, userId))
    .orderBy(desc(schema.publishEvent.publishedAt))
    .limit(limit);
}
