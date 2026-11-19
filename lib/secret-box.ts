import crypto from "node:crypto";

const PREFIX = "v1";

// Read-only compatibility for ciphertext created by the short-lived legacy
// implementation. New secrets are never written with this derived key.
function legacyFallbackKey(): Buffer {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("Legacy encrypted secret cannot be opened without JWT_SECRET");
  return crypto.createHash("sha256").update(`field-enc:${jwtSecret}`).digest();
}

function key(): Buffer {
  const configured = process.env.FIELD_ENCRYPTION_KEY?.trim();
  if (!configured) throw new Error("FIELD_ENCRYPTION_KEY must be configured");
  const decoded = /^[0-9a-f]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (decoded.length !== 32) {
    throw new Error("FIELD_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters or base64)");
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

  const decryptWith = (candidate: Buffer) => {
    const decipher = crypto.createDecipheriv("aes-256-gcm", candidate, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  };
  try {
    return decryptWith(key());
  } catch (primaryError) {
    try {
      return decryptWith(legacyFallbackKey());
    } catch {
      throw primaryError;
    }
  }
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(`${PREFIX}:`);
}
