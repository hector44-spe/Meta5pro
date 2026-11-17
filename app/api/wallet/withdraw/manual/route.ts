export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/appSettings";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { consumeWithdrawalCode } from "@/lib/withdrawalCode";
import { notify, fmtUsd } from "@/lib/notify";
import { notifyAdminWithdrawal } from "@/lib/mail";

class WithdrawalCodeError extends Error {}

const schema = z.object({
  method: z.enum(["BANK", "PAYPAL"]),
  amountUsd: z.number().positive().max(1_000_000_000),
  code: z.string().trim().max(6).default(""),
  recipientName: z.string().trim().min(2).max(100),
  paypalEmail: z.string().trim().email().max(160).optional(),
  bankName: z.string().trim().min(2).max(100).optional(),
  accountNumber: z.string().trim().min(3).max(100).optional(),
  routingNumber: z.string().trim().max(100).optional(),
}).strict();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid withdrawal details" }, { status: 400 });
    }
    const data = parsed.data;
    const settings = await getSettings("withdrawal");

    if (data.method === "BANK") {
      if (!settings.allowBankTransfer) return NextResponse.json({ error: "Bank withdrawals are unavailable" }, { status: 409 });
      if (!data.bankName || !data.accountNumber) return NextResponse.json({ error: "Bank name and account number are required" }, { status: 400 });
    } else {
      if (!settings.allowPayPal) return NextResponse.json({ error: "PayPal withdrawals are unavailable" }, { status: 409 });
      if (!data.paypalEmail) return NextResponse.json({ error: "A valid PayPal email is required" }, { status: 400 });
    }

    const amount = money(data.amountUsd);
    if (amount < settings.minWithdrawal || amount > settings.maxWithdrawal) {
      return NextResponse.json({ error: `Withdrawals must be between ${fmtUsd(settings.minWithdrawal)} and ${fmtUsd(settings.maxWithdrawal)}.` }, { status: 400 });
    }
    if (settings.useWithdrawalCode && !/^\d{6}$/.test(data.code)) {
      return NextResponse.json({ error: "Enter the 6-digit withdrawal code we emailed you" }, { status: 400 });
    }

    const destination = data.method === "BANK"
      ? `${data.recipientName} · ${data.bankName} · ${data.accountNumber}${data.routingNumber ? ` · ${data.routingNumber}` : ""}`
      : `${data.recipientName} · ${data.paypalEmail}`;

    try {
      const { transaction, newBalance } = await atomic(async (tx) => {
        if (settings.useWithdrawalCode) {
          const codeError = await consumeWithdrawalCode(tx, session.userId, data.code);
          if (codeError) throw new WithdrawalCodeError(codeError);
        }
        const newBalance = await debitMain(tx, session.userId, amount, {
          referenceType: "WITHDRAWAL_HOLD",
          counterAccount: "PLATFORM:WITHDRAWAL_HOLDS",
        });
        const transaction = await insertTransaction(tx, {
          userId: session.userId,
          type: "WITHDRAWAL",
          amount,
          currency: data.method === "BANK" ? "BANK TRANSFER" : "PAYPAL",
          cryptoAddress: destination.slice(0, 120),
          status: "PENDING",
        });
        return { transaction, newBalance };
      });

      const reference = transaction.id.slice(0, 8).toUpperCase();
      await Promise.allSettled([
        notify(session.userId, "withdrawal", "Withdrawal requested", `Your ${data.method === "BANK" ? "bank transfer" : "PayPal"} withdrawal of ${fmtUsd(amount)} is pending review. Reference ${reference}.`),
        notifyAdminWithdrawal({
          userEmail: session.email,
          amount,
          currency: data.method === "BANK" ? "Bank transfer" : "PayPal",
          address: destination,
          transactionId: transaction.id,
        }),
      ]);

      return NextResponse.json({ success: true, message: "Withdrawal request submitted for review", reference, transaction, newBalance });
    } catch (error) {
      if (error instanceof InsufficientFundsError) {
        return NextResponse.json({ error: `Insufficient available funds. Current balance: ${fmtUsd(error.available)}` }, { status: 400 });
      }
      if (error instanceof WithdrawalCodeError) return NextResponse.json({ error: error.message }, { status: 400 });
      throw error;
    }
  } catch (error) {
    console.error("Manual withdrawal error:", error);
    return NextResponse.json({ error: "Withdrawal request failed" }, { status: 500 });
  }
}
