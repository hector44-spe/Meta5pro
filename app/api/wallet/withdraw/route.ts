export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { consumeWithdrawalCode } from "@/lib/withdrawalCode";
import { getPrice } from "@/lib/prices";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";
import { notifyAdminWithdrawal } from "@/lib/mail";
import { z } from "zod";

const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 1_000_000;

const withdrawSchema = z.object({
  // Quantity of the coin to receive; the USD value comes from the live price.
  units: z.number().positive("Enter an amount").max(1e12),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/, "Unknown asset"),
  network: z.string().trim().max(30).optional(),
  cryptoAddress: z.string().trim().min(10, "Valid destination crypto address is required").max(120),
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

    const { units, currency: symbol, network, cryptoAddress, code } = parsed.data;

    // 1. Value the request at the live price and check limits before using the code
    const price = await getPrice(symbol);
    if (!price) {
      return NextResponse.json({ error: `Live price for ${symbol} is unavailable. Please try again shortly.` }, { status: 503 });
    }
    const amount = money(units * price);
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is ${fmtUsd(MIN_WITHDRAWAL)} (${fmtUnits(units, symbol)} ≈ ${fmtUsd(amount)}).` }, { status: 400 });
    }
    if (amount > MAX_WITHDRAWAL) {
      return NextResponse.json({ error: `Maximum withdrawal is ${fmtUsd(MAX_WITHDRAWAL)}.` }, { status: 400 });
    }

    // 2. Verify and consume the emailed code in its own transaction, so a wrong
    //    attempt is always recorded (limits guessing) and a code works only once.
    const codeError = await atomic((tx) => consumeWithdrawalCode(tx, session.userId, code));
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }

    const currencyLabel = network ? `${symbol} (${network})` : symbol;

    try {
      // 3. Balance check, debit and pending record happen in one transaction,
      //    so two simultaneous requests cannot both spend the same funds.
      const { transaction, newBalance } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, amount);
        const transaction = await insertTransaction(tx, {
          userId: session.userId,
          type: "WITHDRAWAL",
          amount,
          currency: currencyLabel,
          assetSymbol: symbol,
          assetAmount: units,
          cryptoAddress,
          status: "PENDING",
        });
        return { transaction, newBalance };
      });

      const reference = transaction.id.slice(0, 8).toUpperCase();
      await Promise.all([
        notify(
          session.userId,
          "withdrawal",
          "Withdrawal requested",
          `Your withdrawal of ${fmtUnits(units, symbol)} (≈ ${fmtUsd(amount)}) is pending review. Reference ${reference}. ${fmtUsd(amount)} is on hold.`,
        ),
        notifyAdminWithdrawal({
          userEmail: session.email,
          amount,
          currency: `${fmtUnits(units, symbol)}${network ? ` (${network})` : ""}`,
          address: cryptoAddress,
          transactionId: transaction.id,
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Withdrawal request submitted for review",
        reference,
        usdAmount: amount,
        price,
        transaction,
        newBalance,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient available funds. Current balance: ${fmtUsd(e.available)}` },
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
