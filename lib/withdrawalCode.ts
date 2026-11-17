import crypto from "node:crypto";
import { prisma, type Tx } from "./prisma";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashCode = (userId: string, code: string) =>
  crypto.createHash("sha256").update(`${userId}:${code}`).digest("hex");

/** Creates a fresh 6-digit code for the user (older unused codes are invalidated). */
export async function issueWithdrawalCode(userId: string): Promise<string> {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.$transaction([
    prisma.withdrawalCode.updateMany({ where: { userId, used: false }, data: { used: true } }),
    prisma.withdrawalCode.create({
      data: { userId, codeHash: hashCode(userId, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    }),
  ]);
  return code;
}

/** How many codes the user requested in the last hour (for rate limiting). */
export function recentCodeCount(userId: string): Promise<number> {
  return prisma.withdrawalCode.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
}

/**
 * Checks and consumes the user's latest code inside the caller's transaction.
 * Returns an error message, or null if the code is valid (and is now marked used).
 */
export async function consumeWithdrawalCode(tx: Tx, userId: string, code: string): Promise<string | null> {
  const latest = await tx.withdrawalCode.findFirst({
    where: { userId, used: false },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || latest.expiresAt < new Date()) return "Your code has expired. Request a new one.";
  if (latest.attempts >= MAX_ATTEMPTS) return "Too many wrong attempts. Request a new code.";

  const ok =
    /^\d{6}$/.test(code) &&
    crypto.timingSafeEqual(Buffer.from(latest.codeHash), Buffer.from(hashCode(userId, code)));

  if (!ok) {
    await tx.withdrawalCode.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } });
    return "Incorrect withdrawal code.";
  }

  // Only one request can consume a given code.
  const claim = await tx.withdrawalCode.updateMany({
    where: { id: latest.id, used: false },
    data: { used: true },
  });
  return claim.count === 1 ? null : "This code was already used. Request a new one.";
}
