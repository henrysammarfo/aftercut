/**
 * Better Auth 1.7 — add account.issuer (nullable → backfill → NOT NULL + unique).
 * Usage: node docs/memory/research-raw/_migrate-account-issuer.mjs
 */
import { neon } from "@neondatabase/serverless";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(p) {
  if (!existsSync(p)) return {};
  const o = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    o[m[1]] = v;
  }
  return o;
}

const env = {
  ...loadEnv(resolve("../scoutbot/agent/.env")),
  ...loadEnv(resolve(".env.local")),
  ...process.env,
};
const url = (env.DATABASE_URL || "").trim();
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(url);

console.log("1) add issuer column (nullable)");
await sql`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text`;

console.log("2) backfill issuer");
await sql`UPDATE "account" SET "issuer" = 'local:' || "provider_id" WHERE "issuer" IS NULL OR "issuer" = ''`;

console.log("3) set NOT NULL");
await sql`ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL`;

console.log("4) unique index issuer+account_id");
await sql`CREATE UNIQUE INDEX IF NOT EXISTS "account_issuer_account_id_uidx" ON "account" ("issuer", "account_id")`;

console.log("5) delete orphan users (no credential/oauth account — half-failed signups)");
const deleted = await sql`
  DELETE FROM "user" u
  WHERE NOT EXISTS (SELECT 1 FROM "account" a WHERE a.user_id = u.id)
  RETURNING u.id, u.email
`;
console.log("orphans removed:", deleted.length, deleted.map((r) => r.email));

console.log("ok: account.issuer migrated");
