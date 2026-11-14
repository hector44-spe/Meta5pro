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
    const { amount, signalTitle, strength } = body;
    const signalPrice = money(Number(amount));

    if (!signalPrice || signalPrice <= 0) {
      return NextResponse.json({ error: "Please enter a valid signal amount" }, { status: 400 });
    }

    const ref = `SIG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const { newBalance, purchase } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, signalPrice);

        const purchase = await tx.signalPurchase.create({
          data: {
            userId: session.userId,
            ref,
            signalTitle: signalTitle || "Trading Signal",
            price: signalPrice,
            strength: Number(strength) || 50,
            status: "active",
          },
        });

        await insertTransaction(tx, {
          userId: session.userId,
          type: "TRADE_OPEN",
          amount: signalPrice,
          currency: "USD",
          txHash: `SIG_${Date.now().toString(36).toUpperCase()}`,
          status: "APPROVED",
        });

        return { newBalance, purchase };
      });

      await notify(
        session.userId,
        "trade",
        "Signal Purchased",
        `${fmtUsd(signalPrice)} spent for ${signalTitle || "Signal"} with ${strength || 50}% strength.`,
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
        message: `Successfully purchased ${signalTitle || "Signal"} for $${signalPrice.toLocaleString()}!`,
        newBalance,
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
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Purchase signal error:", error);
    return NextResponse.json({ error: error.message || "Failed to purchase signal" }, { status: 500 });
  }
}
