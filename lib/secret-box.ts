import crypto from "node:crypto";

const PREFIX = "v1";

function fallbackKey(): Buffer {
  const jwtSecret = process.env.JWT_SECRET || "default-broker-platform-secret-key-32";
  return crypto.createHash("sha256").update(`field-enc:${jwtSecret}`).digest();
}

function key(): Buffer {
  const configured = process.env.FIELD_ENCRYPTION_KEY?.trim();
  if (!configured) return fallbackKey();
  const decoded = /^[0-9a-f]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (decoded.length !== 32) {
    return crypto.createHash("sha256").update(configured).digest();
  }
  return decoded;
}

export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

/** Plaintext fallback is read-only compatibility for secrets created before encryption. */
export function decryptSecret(value: string): string {
  if (!value.startsWith(`${PREFIX}:`)) return value;
  const [, ivText, tagText, encryptedText] = value.split(":");
  if (!ivText || !tagText || !encryptedText) throw new Error("Encrypted secret is malformed");

  const iv = Buffer.from(ivText, "base64url");
  const tag = Buffer.from(tagText, "base64url");
  const ciphertext = Buffer.from(encryptedText, "base64url");

  // Try primary configured key
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch (primaryErr) {
    // If a primary key was configured but secret was created with fallback key, attempt fallback
    if (process.env.FIELD_ENCRYPTION_KEY?.trim()) {
      try {
        const fallbackDecipher = crypto.createDecipheriv("aes-256-gcm", fallbackKey(), iv);
        fallbackDecipher.setAuthTag(tag);
        return Buffer.concat([fallbackDecipher.update(ciphertext), fallbackDecipher.final()]).toString("utf8");
      } catch {
        // rethrow primary error if fallback also fails
      }
    }
    throw primaryErr;
  }
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(`${PREFIX}:`);
}
