/**
 * First-100 waitlist — Neon table, created on first write if missing.
 */

import { sql } from "drizzle-orm";

import { getDb, hasDatabase, schema } from "@/db";

async function ensureTable() {
  const db = getDb();
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS creator_waitlist (
      email text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function persistCreatorWaitlist(
  email: string,
): Promise<{ saved: boolean; duplicate: boolean }> {
  if (!hasDatabase()) return { saved: false, duplicate: false };
  await ensureTable();
  const db = getDb();
  const rows = await db
    .insert(schema.creatorWaitlist)
    .values({ email })
    .onConflictDoNothing()
    .returning({ email: schema.creatorWaitlist.email });
  const list = Array.isArray(rows)
    ? rows
    : ((rows as { rows?: { email: string }[] } | undefined)?.rows ?? []);
  return { saved: true, duplicate: list.length === 0 };
}
