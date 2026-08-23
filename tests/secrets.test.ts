import { describe, expect, it } from "vitest";

import { decryptSecret, encryptSecret } from "@/lib/crypto/secrets";

describe("token encryption", () => {
  it("round-trips OAuth tokens", () => {
    const plain = "test-oauth-token-12345";
    const enc = encryptSecret(plain);
    expect(enc.startsWith("v1:")).toBe(true);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("reads legacy plaintext tokens", () => {
    expect(decryptSecret("legacy-plain-token")).toBe("legacy-plain-token");
  });
});
