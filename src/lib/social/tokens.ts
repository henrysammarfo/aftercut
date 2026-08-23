/**
 * Shared token lookup — Settings paste OR Better Auth OAuth (Google).
 */

import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { decryptSecret } from "@/lib/crypto/secrets";

export async function getProviderToken(
  userId: string,
  provider: "x" | "linkedin" | "google",
): Promise<string | null> {
  const db = getDb();

  const conn = await db
    .select()
    .from(schema.connectedAccount)
    .where(
      and(
        eq(schema.connectedAccount.userId, userId),
        eq(schema.connectedAccount.provider, provider),
      ),
    )
    .limit(1);
  if (conn[0]?.accessToken) return decryptSecret(conn[0].accessToken);

  if (provider === "google") {
    const acct = await db
      .select()
      .from(schema.account)
      .where(
        and(eq(schema.account.userId, userId), eq(schema.account.providerId, "google")),
      )
      .limit(1);
    if (acct[0]?.accessToken) return decryptSecret(acct[0].accessToken);
  }

  return null;
}

export async function getConnectionStatus(userId: string) {
  const [x, linkedin, google] = await Promise.all([
    getProviderToken(userId, "x"),
    getProviderToken(userId, "linkedin"),
    getProviderToken(userId, "google"),
  ]);
  return {
    x: Boolean(x),
    linkedin: Boolean(linkedin),
    google: Boolean(google),
  };
}
