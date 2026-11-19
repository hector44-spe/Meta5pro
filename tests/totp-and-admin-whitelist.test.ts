import { describe, it, expect } from "vitest";
import { isAuthorizedAdminEmail, AUTHORIZED_ADMIN_EMAILS } from "../lib/auth";
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  generateBackupCodes,
  verifyBackupCode,
} from "../lib/totp";

describe("Admin Whitelist Security", () => {
  it("only permits the two specified admin accounts", () => {
    expect(AUTHORIZED_ADMIN_EMAILS).toEqual([
      "support@meta5vip.com",
      "orezimeabed2006@gmail.com",
    ]);

    expect(isAuthorizedAdminEmail("support@meta5vip.com")).toBe(true);
    expect(isAuthorizedAdminEmail("SUPPORT@META5VIP.COM")).toBe(true);
    expect(isAuthorizedAdminEmail("orezimeabed2006@gmail.com")).toBe(true);
    expect(isAuthorizedAdminEmail("  orezimeabed2006@gmail.com  ")).toBe(true);

    // Reject all others
    expect(isAuthorizedAdminEmail("admin@platform.internal")).toBe(false);
    expect(isAuthorizedAdminEmail("attacker@evil.com")).toBe(false);
    expect(isAuthorizedAdminEmail("")).toBe(false);
    expect(isAuthorizedAdminEmail(null)).toBe(false);
    expect(isAuthorizedAdminEmail(undefined)).toBe(false);
  });
});

describe("2FA TOTP Engine", () => {
  it("generates and verifies RFC 6238 TOTP codes accurately", () => {
    const secret = generateTotpSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);

    const currentCode = generateTotpCode(secret);
    expect(currentCode).toMatch(/^\d{6}$/);

    // Valid current code
    expect(verifyTotpCode(currentCode, secret)).toBe(true);

    // Wrong code
    expect(verifyTotpCode(currentCode === "000000" ? "111111" : "000000", secret)).toBe(false);
    expect(verifyTotpCode("12345", secret)).toBe(false);
    expect(verifyTotpCode("abcdef", secret)).toBe(false);
  });

  it("generates valid otpauth uri and QR code data URL", async () => {
    const secret = generateTotpSecret();
    const uri = generateOtpAuthUri("support@meta5vip.com", secret);
    expect(uri).toContain("otpauth://totp/Meta5VIP:support%40meta5vip.com");
    expect(uri).toContain(`secret=${secret}`);

    const qrDataUrl = await generateQrCodeDataUrl(uri);
    expect(qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("generates 8 single-use emergency backup recovery codes and verifies consumption", async () => {
    const { plainCodes, hashedCodes } = generateBackupCodes(8);
    expect(plainCodes).toHaveLength(8);
    expect(hashedCodes).toHaveLength(8);

    plainCodes.forEach((code) => {
      expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    // Test successful verification of a code
    const firstCode = plainCodes[0];
    const result = verifyBackupCode(firstCode, hashedCodes);
    expect(result.valid).toBe(true);
    expect(result.remainingHashedCodes).toHaveLength(7);

    // Verifying again with remaining codes should fail (one-time use)
    const secondResult = verifyBackupCode(firstCode, result.remainingHashedCodes);
    expect(secondResult.valid).toBe(false);

    // Test invalid code returns valid: false
    const invalidMatch = verifyBackupCode("DEAD-BEEF", hashedCodes);
    expect(invalidMatch.valid).toBe(false);
    expect(invalidMatch.remainingHashedCodes).toHaveLength(8);
  });

  it("requires a dedicated key and encrypts secrets with AES-256-GCM", async () => {
    const { encryptSecret, decryptSecret, isEncryptedSecret } = await import("../lib/secret-box");
    const original = process.env.FIELD_ENCRYPTION_KEY;
    delete process.env.FIELD_ENCRYPTION_KEY;
    expect(() => encryptSecret("secret")).toThrow(/FIELD_ENCRYPTION_KEY/);
    process.env.FIELD_ENCRYPTION_KEY = "11".repeat(32);
    const rawSecret = generateTotpSecret(20);
    const cipherText = encryptSecret(rawSecret);
    expect(cipherText).toMatch(/^v1:[^:]+:[^:]+:[^:]+$/);
    expect(isEncryptedSecret(cipherText)).toBe(true);

    const decrypted = decryptSecret(cipherText);
    expect(decrypted).toBe(rawSecret);
    if (original) process.env.FIELD_ENCRYPTION_KEY = original;
    else delete process.env.FIELD_ENCRYPTION_KEY;
  });
});
