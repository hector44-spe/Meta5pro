const JWT_SECRET =
  process.env.JWT_SECRET || "meta-gold-5-secure-jwt-secret-key-2026-production";

export interface EdgeTokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
  exp?: number;
}

export async function verifyEdgeToken(
  token: string,
): Promise<EdgeTokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Verify expiration
    const payloadStr = atob(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const payload: EdgeTokenPayload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // 2. Cryptographic signature check with Web Crypto API
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    // Convert base64url signature to Uint8Array
    const binStr = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const signature = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      signature[i] = binStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      data,
    );

    return isValid ? payload : null;
  } catch {
    return null;
  }
}
