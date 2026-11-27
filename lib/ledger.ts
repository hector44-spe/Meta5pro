import { Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { prisma, type Tx } from "./prisma";

/**
 * All balance changes go through these helpers. Each one is a single conditional
 * UPDATE, and callers run them inside `atomic()` (a Prisma interactive transaction),
 * so a balance check and the write that depends on it can never be split by another request.
 */

/** Round to cents. Postgres stores DECIMAL(18,2), so this just keeps app-side numbers tidy. */
export const money = (n: number) => Math.round(n * 100) / 100;

export function atomic<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn, {
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    maxWait: 10_000,
    timeout: 20_000,
  });
}

export class InsufficientFundsError extends Error {
  constructor(public available: number) {
    super("Insufficient funds");
  }
}

export interface LedgerContext {
  referenceType?: string;
  referenceId?: string;
  description?: string;
  counterAccount?: string;
}

async function recordBalancedTransfer(
  tx: Tx,
  userId: string,
  userAccount: string,
  amount: number,
  direction: "credit" | "debit",
  context: LedgerContext = {},
) {
  const transferId = crypto.randomUUID();
  const value = money(amount);
  const userAmount = direction === "credit" ? value : -value;
  await tx.ledgerEntry.createMany({
    data: [
      {
        transferId,
        userId,
        account: userAccount,
        amount: userAmount,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
      },
      {
        transferId,
        account: context.counterAccount || "PLATFORM_CLEARING",
        amount: -userAmount,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
      },
    ],
  });
}

export async function getMainBalance(tx: Tx, userId: string): Promise<number | null> {
  const w = await tx.wallet.findUnique({ where: { userId }, select: { mainBalance: true } });
  return w ? w.mainBalance.toNumber() : null;
}

/** Debits mainBalance only if enough funds exist; throws InsufficientFundsError otherwise. */
export async function debitMain(tx: Tx, userId: string, amount: number, context: LedgerContext = {}): Promise<number> {
  const amt = money(amount);
  const res = await tx.wallet.updateMany({
    where: { userId, mainBalance: { gte: amt } },
    data: { mainBalance: { decrement: amt } },
  });
  if (res.count !== 1) throw new InsufficientFundsError((await getMainBalance(tx, userId)) ?? 0);
  await recordBalancedTransfer(tx, userId, `USER:${userId}:MAIN`, amt, "debit", context);
  return (await getMainBalance(tx, userId))!;
}

export async function creditMain(
  tx: Tx,
  userId: string,
  amount: number,
  opts: { deposited?: boolean } & LedgerContext = {},
): Promise<number> {
  const amt = money(amount);
  const w = await tx.wallet.update({
    where: { userId },
    data: {
      mainBalance: { increment: amt },
      ...(opts.deposited ? { totalDeposited: { increment: amt } } : {}),
    },
    select: { mainBalance: true },
  });
  await recordBalancedTransfer(tx, userId, `USER:${userId}:MAIN`, amt, "credit", opts);
  return w.mainBalance.toNumber();
}

export async function creditInterest(tx: Tx, userId: string, amount: number, context: LedgerContext = {}) {
  const amt = money(amount);
  await tx.wallet.update({
    where: { userId },
    data: { interestBalance: { increment: amt } },
  });
  await recordBalancedTransfer(tx, userId, `USER:${userId}:INTEREST`, amt, "credit", context);
}

export async function addWithdrawn(tx: Tx, userId: string, amount: number) {
  await tx.wallet.update({
    where: { userId },
    data: { totalWithdrawn: { increment: money(amount) } },
  });
}

export function insertTransaction(
  tx: Tx,
  t: {
    userId: string;
    type: string;
    amount: number;
    currency: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    cryptoAddress?: string | null;
    txHash?: string | null;
    receiptUrl?: string | null;
    assetSymbol?: string | null;
    assetAmount?: number | null;
  },
) {
  return tx.transaction.create({ data: { ...t, amount: money(t.amount) } });
}

/** Moves a PENDING transaction to a final status. Returns false if someone else already did. */
export async function settlePending(
  tx: Tx,
  txId: string,
  status: "APPROVED" | "REJECTED",
): Promise<boolean> {
  const res = await tx.transaction.updateMany({
    where: { id: txId, status: "PENDING" },
    data: { status, approvedAt: new Date() },
  });
  return res.count === 1;
}

export function audit(
  client: Tx | typeof prisma,
  userId: string,
  action: string,
  ip?: string | null,
  details?: string | null,
  targetUserId?: string | null,
) {
  return (client as any).activityLog.create({
    data: {
      userId,
      targetUserId: targetUserId || null,
      action,
      ipAddress: ip || null,
      details: details || null,
    },
  });
}
