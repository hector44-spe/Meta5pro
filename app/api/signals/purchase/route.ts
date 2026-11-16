import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.signalPurchase.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const history = rows.map((r) => ({
      id: r.id,
      ref: r.ref,
      signal: r.signalTitle,
      signalTitle: r.signalTitle,
      price: r.price.toNumber(),
      strength: r.strength,
      status: r.status,
      date: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("Fetch signal history error:", error);
    return NextResponse.json({ success: true, history: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, signalTitle, strength, currency, network, txHash, receiptUrl, cryptoAddress } = body;
    const signalPrice = money(Number(amount));

    if (!signalPrice || signalPrice <= 0) {
      return NextResponse.json({ error: "Please enter a valid signal amount" }, { status: 400 });
    }

    const ref = `SIG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      // Signals must be a fresh deposit and NOT deducted from user balance
      const purchase = await prisma.signalPurchase.create({
        data: {
          userId: session.userId,
          ref,
          signalTitle: signalTitle || "Trading Signal",
          price: signalPrice,
          strength: Number(strength) || 50,
          status: "pending",
        },
      });

      // Record a dedicated fresh deposit transaction for this signal purchase
      await prisma.transaction.create({
        data: {
          userId: session.userId,
          type: "DEPOSIT",
          status: "PENDING",
          amount: signalPrice,
          currency: currency ? String(currency).toUpperCase() : "USDT",
          txHash: txHash ? String(txHash).trim() : `SIG_${Date.now().toString(36).toUpperCase()}`,
          receiptUrl: receiptUrl ? String(receiptUrl).trim() : undefined,
          cryptoAddress: cryptoAddress ? String(cryptoAddress).trim() : undefined,
        },
      });

      await notify(
        session.userId,
        "deposit",
        "Signal Deposit Submitted",
        `Fresh deposit of ${fmtUsd(signalPrice)} submitted for ${signalTitle || "Signal"} (${strength || 50}% strength). Pending verification.`,
      );

      const allPurchases = await prisma.signalPurchase.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      const history = allPurchases.map((r) => ({
        id: r.id,
        ref: r.ref,
        signal: r.signalTitle,
        signalTitle: r.signalTitle,
        price: r.price.toNumber(),
        strength: r.strength,
        status: r.status,
        date: r.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        message: `Fresh deposit of $${signalPrice.toLocaleString()} submitted for ${signalTitle || "Signal"}. Your signal will activate upon deposit confirmation!`,
        signal: {
          id: purchase.id,
          ref: purchase.ref,
          signal: purchase.signalTitle,
          price: purchase.price.toNumber(),
          strength: purchase.strength,
          status: purchase.status,
          date: purchase.createdAt.toISOString(),
        },
        history,
      });
    } catch (err: any) {
      console.error("Signal fresh deposit error:", err);
      return NextResponse.json({ error: err.message || "Failed to process signal deposit." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Purchase signal error:", error);
    return NextResponse.json({ error: error.message || "Failed to purchase signal" }, { status: 500 });
  }
}
