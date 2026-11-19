import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer into RFC 4648 Base32 string (without padding)
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 4648 Base32 string into a Buffer
 */
export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      continue; // Skip padding or invalid characters
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a cryptographically random 20-byte (160-bit) Base32 secret for TOTP
 */
export function generateTotpSecret(bytes = 20): string {
  const randomBytes = crypto.randomBytes(bytes);
  return base32Encode(randomBytes);
}

/**
 * Generates an RFC 6238 6-digit TOTP code for a given time-step window
 */
export function generateTotpCode(secret: string, windowOffset = 0, timeStepSeconds = 30): string {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / timeStepSeconds) + windowOffset;

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(timeStep));

  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code against a Base32 secret with window tolerance (+-1 step = +-30s)
 */
export function verifyTotpCode(code: string, secret: string, window = 1): boolean {
  if (!code || !secret) return false;
  const cleanedCode = code.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanedCode)) return false;

  for (let offset = -window; offset <= window; offset++) {
    const expected = generateTotpCode(secret, offset);
    if (crypto.timingSafeEqual(Buffer.from(cleanedCode), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates the standard otpauth URI compatible with Google Authenticator, Authy, etc.
 */
export function generateOtpAuthUri(email: string, secret: string, issuer = "Meta5VIP"): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(email)}`;
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates a data URL QR code image from an otpauth URI
 */
export async function generateQrCodeDataUrl(otpAuthUri: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * Generates emergency single-use backup recovery codes
 */
export function generateBackupCodes(count = 8): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const p1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const p2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const code = `${p1}-${p2}`;
    plainCodes.push(code);
    hashedCodes.push(bcrypt.hashSync(code, 10));
  }

  return { plainCodes, hashedCodes };
}

/**
 * Verifies and consumes a one-time backup recovery code
 */
export function verifyBackupCode(
  inputCode: string,
  hashedCodes: string[]
): { valid: boolean; remainingHashedCodes: string[] } {
  if (!inputCode || !Array.isArray(hashedCodes) || hashedCodes.length === 0) {
    return { valid: false, remainingHashedCodes: hashedCodes || [] };
  }

  const cleaned = inputCode.trim().toUpperCase();

  for (let i = 0; i < hashedCodes.length; i++) {
    const match = bcrypt.compareSync(cleaned, hashedCodes[i]);
    if (match) {
      const remaining = [...hashedCodes];
      remaining.splice(i, 1);
      return { valid: true, remainingHashedCodes: remaining };
    }
  }

  return { valid: false, remainingHashedCodes: hashedCodes };
}
