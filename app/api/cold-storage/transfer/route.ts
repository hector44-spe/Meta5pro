export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, creditMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";
import { z } from "zod";

const transferSchema = z.object({
  action: z.enum(["deposit", "withdraw"]),
  symbol: z.string().trim().toUpperCase(),
  amount: z.number().positive("Amount must be positive"),
  price: z.number().positive("Asset price must be positive"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = transferSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { action, symbol, amount, price } = parsed.data;
    const usdValue = money(amount * price);

    try {
      const { newBalance, updatedAsset } = await atomic(async (tx) => {
        if (action === "deposit") {
          // 1. Debit trading balance
          const newBalance = await debitMain(tx, session.userId, usdValue);

          // 2. Add to cold storage
          const updatedAsset = await tx.coldStorageAsset.upsert({
            where: {
              userId_symbol: {
                userId: session.userId,
                symbol,
              },
            },
            create: {
              userId: session.userId,
              symbol,
              amount,
            },
            update: {
              amount: { increment: amount },
            },
          });

          // 3. Record transaction
          await insertTransaction(tx, {
            userId: session.userId,
            type: "COLD_STORAGE_DEPOSIT",
            amount: usdValue,
            currency: symbol,
            assetSymbol: symbol,
            assetAmount: amount,
            txHash: `COLD_IN_${Date.now().toString(36).toUpperCase()}`,
            status: "APPROVED",
          });

          return { newBalance, updatedAsset };
        } else {
          // action === "withdraw" (cold storage -> trading wallet)
          const existing = await tx.coldStorageAsset.findUnique({
            where: {
              userId_symbol: {
                userId: session.userId,
                symbol,
              },
            },
          });

          const currentColdAmt = existing ? existing.amount.toNumber() : 0;
          if (currentColdAmt < amount) {
            throw new Error(`Insufficient ${symbol} in cold storage. Available: ${currentColdAmt}`);
          }

          // 1. Decrement cold storage
          const updatedAsset = await tx.coldStorageAsset.update({
            where: {
              userId_symbol: {
                userId: session.userId,
                symbol,
              },
            },
            data: {
              amount: { decrement: amount },
            },
          });

          // 2. Credit trading balance
          const newBalance = await creditMain(tx, session.userId, usdValue);

          // 3. Record transaction
          await insertTransaction(tx, {
            userId: session.userId,
            type: "COLD_STORAGE_WITHDRAW",
            amount: usdValue,
            currency: symbol,
            assetSymbol: symbol,
            assetAmount: amount,
            txHash: `COLD_OUT_${Date.now().toString(36).toUpperCase()}`,
            status: "APPROVED",
          });

          return { newBalance, updatedAsset };
        }
      });

      const actionText = action === "deposit" ? "Transferred to Cold Storage" : "Withdrawn from Cold Storage";
      await notify(
        session.userId,
        "account",
        actionText,
        `${fmtUnits(amount, symbol)} (≈ ${fmtUsd(usdValue)}) ${action === "deposit" ? "safely moved to offline cold vault" : "transferred back to your trading balance"}.`,
      );

      // Return updated list of cold assets
      const allCold = await prisma.coldStorageAsset.findMany({
        where: { userId: session.userId, amount: { gt: 0 } },
      });

      return NextResponse.json({
        success: true,
        message: `${actionText} successfully: ${amount} ${symbol}`,
        newBalance,
        asset: {
          symbol: updatedAsset.symbol,
          amount: updatedAsset.amount.toNumber(),
        },
        assets: allCold.map((a) => ({ symbol: a.symbol, amount: a.amount.toNumber() })),
      });
    } catch (err: any) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient trading balance. Required: $${usdValue.toFixed(2)}, Available: $${err.available.toFixed(2)}` },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: err.message || "Transfer failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Cold storage transfer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
