import { prisma, type Tx } from "./prisma";

export type NotificationKind = "deposit" | "withdrawal" | "balance" | "security" | "account" | "trade" | "investment";

/**
 * Adds an in-app notification for a user. Never throws: a failed notification
 * must not break the action that triggered it. Pass `tx` to include it in a
 * surrounding transaction.
 */
export async function notify(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string,
  tx?: Tx,
): Promise<void> {
  try {
    await (tx ?? prisma).notification.create({ data: { userId, kind, title, body } });
  } catch (err) {
    console.error("[notify] failed:", title, err);
  }
}

export const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtUnits = (n: number, symbol: string) =>
  `${Number(n.toFixed(8)).toString()} ${symbol}`;
