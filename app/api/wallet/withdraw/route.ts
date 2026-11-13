export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, InsufficientFundsError } from "@/lib/ledger";
import { consumeWithdrawalCode } from "@/lib/withdrawalCode";
import { notifyAdminWithdrawal } from "@/lib/mail";
import { z } from "zod";

const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 1_000_000;

const withdrawSchema = z.object({
  amount: z
    .number()
    .min(MIN_WITHDRAWAL, `Minimum withdrawal is $${MIN_WITHDRAWAL}`)
    .max(MAX_WITHDRAWAL, `Maximum withdrawal is $${MAX_WITHDRAWAL.toLocaleString()}`),
  cryptoAddress: z.string().trim().min(10, "Valid destination crypto address is required").max(120),
  currency: z.string().trim().max(40).default("BTC"),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit withdrawal code we emailed you"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = withdrawSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { amount, cryptoAddress, currency, code } = parsed.data;

    // 1. Verify and consume the emailed code in its own transaction, so a wrong
    //    attempt is always recorded (limits guessing) and a code works only once.
    const codeError = await atomic((tx) => consumeWithdrawalCode(tx, session.userId, code));
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }

    try {
      // 2. Balance check, debit and pending record happen in one transaction,
      //    so two simultaneous requests cannot both spend the same funds.
      const { transaction, newBalance } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, amount);
        const transaction = await insertTransaction(tx, {
          userId: session.userId,
          type: "WITHDRAWAL",
          amount,
          currency,
          cryptoAddress,
          status: "PENDING",
        });
        return { transaction, newBalance };
      });

      await notifyAdminWithdrawal({
        userEmail: session.email,
        amount,
        currency,
        address: cryptoAddress,
        transactionId: transaction.id,
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal request submitted for review",
        transaction,
        newBalance,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient available funds. Current balance: $${e.available.toFixed(2)} USD` },
          { status: 400 },
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
