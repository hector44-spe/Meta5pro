import { Prisma } from "@prisma/client";
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

export async function getMainBalance(tx: Tx, userId: string): Promise<number | null> {
  const w = await tx.wallet.findUnique({ where: { userId }, select: { mainBalance: true } });
  return w ? w.mainBalance.toNumber() : null;
}

/** Debits mainBalance only if enough funds exist; throws InsufficientFundsError otherwise. */
export async function debitMain(tx: Tx, userId: string, amount: number): Promise<number> {
  const amt = money(amount);
  const res = await tx.wallet.updateMany({
    where: { userId, mainBalance: { gte: amt } },
    data: { mainBalance: { decrement: amt } },
  });
  if (res.count !== 1) throw new InsufficientFundsError((await getMainBalance(tx, userId)) ?? 0);
  return (await getMainBalance(tx, userId))!;
}

export async function creditMain(
  tx: Tx,
  userId: string,
  amount: number,
  opts: { deposited?: boolean } = {},
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
  return w.mainBalance.toNumber();
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

export function audit(tx: Tx, userId: string, action: string, ip: string, details: string) {
  return tx.activityLog.create({ data: { userId, action, ipAddress: ip, details } });
}
