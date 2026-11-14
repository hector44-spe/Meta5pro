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

    const key = `subscriptions_${session.userId}`;
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    const history = (setting && Array.isArray(setting.value)) ? setting.value : [];
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("Fetch subscription history error:", error);
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
    const { planId, amount, planName, duration, roi } = body;
    const subAmount = Number(amount);

    if (!subAmount || subAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid investment amount" }, { status: 400 });
    }

    try {
      const { newBalance, subscriptionItem } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, subAmount);

        await insertTransaction(tx, {
          userId: session.userId,
          type: "INVESTMENT_SUBSCRIBE",
          amount: subAmount,
          currency: "USD",
          txHash: `SUB_${Date.now().toString(36).toUpperCase()}`,
          status: "APPROVED",
        });

        const subscriptionItem = {
          ref: `SUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          plan: planName || "Subscription Plan",
          duration: Number(duration) || 3,
          daysLeft: Number(duration) || 3,
          amount: subAmount,
          roi: Number(roi) || 200,
          status: "open",
          date: new Date().toISOString(),
        };

        return { newBalance, subscriptionItem };
      });

      // Update user's subscriptions history in AppSetting
      const key = `subscriptions_${session.userId}`;
      const existing = await prisma.appSetting.findUnique({ where: { key } });
      const currentHistory = (existing && Array.isArray(existing.value)) ? existing.value : [];
      const updatedHistory = [subscriptionItem, ...currentHistory];

      await prisma.appSetting.upsert({
        where: { key },
        update: { value: updatedHistory as any },
        create: { key, value: updatedHistory as any },
      });

      await notify(
        session.userId,
        "investment",
        "Subscription Started",
        `${fmtUsd(subAmount)} successfully subscribed to ${planName || "Plan"} for ${duration || 3} days.`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully subscribed $${subAmount.toLocaleString()} to ${planName || "Plan"}!`,
        newBalance,
        subscription: subscriptionItem,
        history: updatedHistory,
      });
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: error.message || "Failed to process subscription" }, { status: 500 });
  }
}
