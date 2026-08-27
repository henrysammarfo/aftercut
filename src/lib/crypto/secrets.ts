/**
 * AES-256-GCM for OAuth tokens at rest in connected_account.
 * Requires TOKEN_ENCRYPTION_KEY — no secret fallbacks.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const PREFIX = "v1:";

function encryptionKey(): Buffer {
  const secret = process.env["TOKEN_ENCRYPTION_KEY"]?.trim();
  if (!secret) {
    throw new Error("TOKEN_ENCRYPTION_KEY is required for OAuth token encryption.");
  }
  return scryptSync(secret, "aftercut-token-v1", 32);
}

export function encryptSecret(plain: string): string {
  if (!plain) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!stored.startsWith(PREFIX)) return stored;
  const parts = stored.slice(PREFIX.length).split(":");
  if (parts.length !== 3) return stored;
  const [ivB64, tagB64, dataB64] = parts;
  if (!ivB64 || !tagB64 || !dataB64) return stored;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function secretsEncryptionEnabled(): boolean {
  return Boolean(process.env["TOKEN_ENCRYPTION_KEY"]?.trim());
}
