import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `signals_${session.userId}`;
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    const history = (setting && Array.isArray(setting.value)) ? setting.value : [];
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
    const { signalId, amount, signalTitle, strength } = body;
    const signalPrice = Number(amount);

    if (!signalPrice || signalPrice <= 0) {
      return NextResponse.json({ error: "Please enter a valid signal amount" }, { status: 400 });
    }

    try {
      const { newBalance, signalItem } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, signalPrice);

        await insertTransaction(tx, {
          userId: session.userId,
          type: "TRADE_OPEN",
          amount: signalPrice,
          currency: "USD",
          txHash: `SIG_${Date.now().toString(36).toUpperCase()}`,
          status: "APPROVED",
        });

        const signalItem = {
          ref: `SIG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          signal: signalTitle || "Trading Signal",
          price: signalPrice,
          strength: Number(strength) || 50,
          status: "active",
          date: new Date().toISOString(),
        };

        return { newBalance, signalItem };
      });

      // Update user's signals history in AppSetting
      const key = `signals_${session.userId}`;
      const existing = await prisma.appSetting.findUnique({ where: { key } });
      const currentHistory = (existing && Array.isArray(existing.value)) ? existing.value : [];
      const updatedHistory = [signalItem, ...currentHistory];

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: updatedHistory as any },
        create: { key, value: updatedHistory as any },
      });

      await notify(
        session.userId,
        "trade",
        "Signal Purchased",
        `${fmtUsd(signalPrice)} spent for ${signalTitle || "Signal"} with ${strength || 50}% strength.`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully purchased ${signalTitle || "Signal"} for $${signalPrice.toLocaleString()}!`,
        newBalance,
        signal: signalItem,
        history: updatedHistory,
      });
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Signal purchase error:", error);
    return NextResponse.json({ error: error.message || "Failed to purchase signal" }, { status: 500 });
  }
}
