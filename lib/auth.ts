import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { isIP } from "node:net";
import { Prisma } from "@prisma/client";
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


export const AUTH_COOKIE = COOKIE_NAME;

export const AUTHORIZED_ADMIN_EMAILS = Object.freeze([
  "support@meta5vip.com",
  "orezimeabed2006@gmail.com",
]);

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.some(
    (allowed) => allowed.toLowerCase() === email.trim().toLowerCase()
  );
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
  tokenVersion?: number;
  twoFactorVerified?: boolean;
  twoFactorRequired?: boolean;
}

export interface TwoFactorTempPayload {
  userId: string;
  email: string;
  role: string;
  needsSetup?: boolean;
  is2FaTemp: boolean;
}

export function sign2FaTempToken(payload: { userId: string; email: string; role: string; needsSetup?: boolean }): string {
  return jwt.sign({ ...payload, is2FaTemp: true }, getJwtSecret(), { expiresIn: "10m", algorithm: "HS256" });
}

export function verify2FaTempToken(token: string): TwoFactorTempPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as any;
    if (decoded && decoded.is2FaTemp && decoded.userId) {
      return decoded as TwoFactorTempPayload;
    }
    return null;
  } catch {
    return null;
  }
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
 * Validates tokenVersion: if password was changed/reset, older sessions are rejected.
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
      select: { role: true, status: true, tokenVersion: true, twoFactorEnabled: true },
    });
    if (!row || row.status !== "ACTIVE") return null;
    if (payload.tokenVersion !== undefined && row.tokenVersion !== payload.tokenVersion) {
      return null;
    }
    const isAuthorizedAdmin = row.role === "ADMIN" && isAuthorizedAdminEmail(payload.email);
    const effectiveRole = isAuthorizedAdmin ? "ADMIN" : (row.role === "ADMIN" ? "INVESTOR" : row.role);
    return {
      ...payload,
      role: effectiveRole,
      tokenVersion: row.tokenVersion,
      twoFactorRequired: !!row.twoFactorEnabled,
      twoFactorVerified: !!payload.twoFactorVerified,
    };
  } catch {
    return null;
  }
}

/* Database-backed limiter; the local map is only a fail-safe for tests/startup outages. */
const attempts = new Map<string, { count: number; resetAt: number }>();

function pruneExpiredAttempts() {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if (entry.resetAt < now) {
      attempts.delete(key);
    }
  }
}

function localRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (attempts.size > 2000) pruneExpiredAttempts();

  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

/** Returns true if the key is over the limit. Shared by every app instance. */
export async function rateLimited(key: string, max = 5, windowMs = 15 * 60 * 1000): Promise<boolean> {
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  if (process.env.NODE_ENV === "test") return localRateLimited(hashedKey, max, windowMs);
  const now = new Date();

  for (let retry = 0; retry < 3; retry++) {
    try {
      const count = await prisma.$transaction(async (tx) => {
        const row = await tx.authRateLimit.findUnique({ where: { key: hashedKey } });
        if (!row) {
          await tx.authRateLimit.create({
            data: { key: hashedKey, count: 1, resetAt: new Date(now.getTime() + windowMs) },
          });
          return 1;
        }
        if (row.resetAt <= now) {
          await tx.authRateLimit.update({
            where: { key: hashedKey },
            data: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
          });
          return 1;
        }
        const updated = await tx.authRateLimit.update({
          where: { key: hashedKey },
          data: { count: { increment: 1 } },
          select: { count: true },
        });
        return updated.count;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return count > max;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && retry < 2) {
        continue;
      }
      // Authentication should still be throttled if the limiter table is temporarily unavailable.
      return localRateLimited(hashedKey, max, windowMs);
    }
  }
  return true;
}

export function clearRateLimit(key: string) {
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  attempts.delete(hashedKey);
  if (process.env.NODE_ENV === "test") return;
  void prisma.authRateLimit.delete({ where: { key: hashedKey } }).catch(() => {});
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean) ?? [];
  const trustedHops = Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS || "1", 10) || 0);
  const candidate = forwarded.length
    ? forwarded[Math.max(0, forwarded.length - trustedHops)]
    : req.headers.get("x-real-ip");
  return candidate && isIP(candidate) ? candidate : "unknown";
}

