export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const depositSchema = z.object({
  amount: z.number().positive("Deposit amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  network: z.string().optional(),
  txHash: z.string().optional(),
  cryptoAddress: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { amount, currency, network, txHash, cryptoAddress, receiptUrl } = parsed.data;

    // Must have either receipt screenshot or txHash
    if (!receiptUrl && !txHash) {
      return NextResponse.json(
        { error: "Please upload a payment screenshot proof or provide a transaction hash." },
        { status: 400 },
      );
    }

    const generatedHash = txHash || `PROOF_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fullCurrency = network ? `${currency} (${network})` : currency;

    const transaction = await db.transaction.create({
      data: {
        userId: session.userId,
        type: "DEPOSIT",
        amount,
        currency: fullCurrency,
        cryptoAddress: cryptoAddress || null,
        txHash: generatedHash,
        receiptUrl: receiptUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit submitted successfully. Awaiting administrative review.",
      transaction,
    });
  } catch (error) {
    console.error("Deposit submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
