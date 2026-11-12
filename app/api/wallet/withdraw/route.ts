export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const withdrawSchema = z.object({
  amount: z.number().positive("Withdrawal amount must be greater than 0"),
  cryptoAddress: z.string().min(10, "Valid destination crypto address is required"),
  currency: z.string().default("BTC"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = withdrawSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { amount, cryptoAddress, currency } = parsed.data;

    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.mainBalance < amount) {
      return NextResponse.json(
        {
          error: `Insufficient available funds. Current balance: $${wallet.mainBalance.toFixed(
            2,
          )} USD`,
        },
        { status: 400 },
      );
    }

    // Deduct from balance immediately to prevent double-spending
    const updatedWallet = await db.wallet.update({
      where: { userId: session.userId },
      data: {
        mainBalance: wallet.mainBalance - amount,
      },
    });

    // Record pending transaction in moderation queue
    const transaction = await db.transaction.create({
      data: {
        userId: session.userId,
        type: "WITHDRAWAL",
        amount,
        currency,
        cryptoAddress,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted for forensic review",
      transaction,
      newBalance: updatedWallet.mainBalance,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
