import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = process.env.COOKIE_NAME || "mg5_token";

/** Reads JWT_SECRET lazily so builds don't need it, but every sign/verify does. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Returns the session only if the token is valid AND the user still exists and is ACTIVE.
 * Role is taken from the database, so demoting or suspending a user takes effect immediately.
 */
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const row = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, status: true },
    });
    if (!row || row.status !== "ACTIVE") return null;
    return { ...payload, role: row.role };
  } catch {
    return null;
  }
}

/* ---------- simple in-memory rate limiter (per process) ---------- */
const attempts = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the key is over the limit. */
export function rateLimited(key: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export const AUTH_COOKIE = COOKIE_NAME;
