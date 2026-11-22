import { prisma, type Tx } from "./prisma";

export const DEFAULT_WITHDRAWAL_CODE = "123456";

/**
 * Validates the user's withdrawal code against their custom code (if set) or the default code ("123456").
 * Returns an error message if invalid, or null if valid.
 */
export async function consumeWithdrawalCode(
  tx: Tx,
  userId: string,
  code: string
): Promise<string | null> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { withdrawalCode: true },
  });

  const expectedCode = (user?.withdrawalCode && user.withdrawalCode.trim()) || DEFAULT_WITHDRAWAL_CODE;
  const cleanedInput = (code || "").trim();

  if (!cleanedInput || cleanedInput !== expectedCode) {
    return "Incorrect withdrawal code. Contact admin for your withdrawal code.";
  }

  return null;
}

/** Legacy helper: maintained for any remaining references */
export async function issueWithdrawalCode(_userId: string): Promise<string> {
  return DEFAULT_WITHDRAWAL_CODE;
}

/** Legacy helper: returns 0 */
export async function recentCodeCount(_userId: string): Promise<number> {
  return 0;
}
