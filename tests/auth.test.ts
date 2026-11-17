import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken, rateLimited, clearRateLimit } from "../lib/auth";

process.env.JWT_SECRET = "super_secret_test_key_minimum_32_characters_long_123456";

describe("Authentication & Session Security", () => {
  it("should securely hash and verify passwords", async () => {
    const rawPassword = "P@ssword123!Secure";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).not.toBe(rawPassword);
    expect(hashed).toMatch(/^\$2[aby]\$/);

    const isValid = await verifyPassword(rawPassword, hashed);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword("WrongPassword", hashed);
    expect(isWrong).toBe(false);
  });

  it("should sign and verify JWT tokens with tokenVersion", () => {
    const payload = {
      userId: "usr_test_123",
      email: "test@example.com",
      role: "INVESTOR",
      username: "testuser",
      tokenVersion: 1,
    };

    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.tokenVersion).toBe(1);
  });

  it("should reject tampered or invalid JWT tokens", () => {
    const token = signToken({
      userId: "usr_1",
      email: "a@b.com",
      role: "INVESTOR",
      username: "usr1",
      tokenVersion: 1,
    });

    const tampered = token.slice(0, -5) + "abcde";
    expect(verifyToken(tampered)).toBeNull();
    expect(verifyToken("not.a.valid.jwt")).toBeNull();
  });

  it("should correctly rate limit attempts and clear on success", async () => {
    const key = `test_limit_${Date.now()}`;
    clearRateLimit(key);

    // Limit is 3 attempts
    expect(await rateLimited(key, 3)).toBe(false); // 1
    expect(await rateLimited(key, 3)).toBe(false); // 2
    expect(await rateLimited(key, 3)).toBe(false); // 3
    expect(await rateLimited(key, 3)).toBe(true);  // 4 -> blocked!

    clearRateLimit(key);
    expect(await rateLimited(key, 3)).toBe(false); // reset
  });
});
