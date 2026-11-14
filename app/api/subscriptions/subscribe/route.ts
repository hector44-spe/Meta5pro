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

    // Query real relational investments for this user
    const rows = await prisma.investment.findMany({
      where: { userId: session.userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    const history = rows.map((inv) => ({
      id: inv.id,
      ref: `INV-${inv.id.slice(0, 8).toUpperCase()}`,
      plan: inv.plan?.name || "Subscription Plan",
      duration: inv.plan?.durationDays || 3,
      daysLeft: inv.daysRemaining,
      amount: inv.amount.toNumber(),
      roi: inv.plan ? Number((inv.plan.dailyRoiPercentage.toNumber() * inv.plan.durationDays).toFixed(1)) : 200,
      accruedProfit: inv.accruedProfit.toNumber(),
      status: inv.status.toLowerCase(),
      date: inv.createdAt.toISOString(),
    }));

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
    const subAmount = money(Number(amount));

    if (!subAmount || subAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid investment amount" }, { status: 400 });
    }

    const planDuration = Number(duration) || 3;
    const totalRoi = Number(roi) || 200;
    const dailyRoi = Number((totalRoi / planDuration).toFixed(3));
    const targetName = planName || "Subscription Plan";

    // 1. Find or create matching relational Plan in Postgres
    let plan = await prisma.plan.findFirst({
      where: {
        OR: [
          ...(planId ? [{ id: planId }] : []),
          { name: { equals: targetName, mode: "insensitive" } },
        ],
      },
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: targetName,
          minDeposit: money(subAmount > 1000 ? 1000 : subAmount),
          maxDeposit: money(subAmount * 10),
          dailyRoiPercentage: dailyRoi,
          durationDays: planDuration,
          capitalRefund: true,
          isActive: true,
        },
      });
    }

    try {
      const { newBalance, investment } = await atomic(async (tx) => {
        // 2. Atomically debit user balance
        const newBalance = await debitMain(tx, session.userId, subAmount);

        // 3. Create real relational Investment
        const investment = await tx.investment.create({
          data: {
            userId: session.userId,
            planId: plan.id,
            amount: subAmount,
            daysRemaining: plan.durationDays,
            status: "RUNNING",
          },
          include: {
            plan: true,
          },
        });

        // 4. Record ledger transaction
        await insertTransaction(tx, {
          userId: session.userId,
          type: "INVESTMENT_SUBSCRIBE",
          amount: subAmount,
          currency: "USD",
          txHash: `SUB_${investment.id.substring(0, 8).toUpperCase()}`,
          status: "APPROVED",
        });

        return { newBalance, investment };
      });

      await notify(
        session.userId,
        "investment",
        "Subscription Started",
        `${fmtUsd(subAmount)} successfully subscribed to ${plan.name} for ${plan.durationDays} days.`,
      );

      // Fetch updated history
      const allRows = await prisma.investment.findMany({
        where: { userId: session.userId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      });

      const history = allRows.map((inv) => ({
        id: inv.id,
        ref: `INV-${inv.id.slice(0, 8).toUpperCase()}`,
        plan: inv.plan?.name || "Subscription Plan",
        duration: inv.plan?.durationDays || 3,
        daysLeft: inv.daysRemaining,
        amount: inv.amount.toNumber(),
        roi: inv.plan ? Number((inv.plan.dailyRoiPercentage.toNumber() * inv.plan.durationDays).toFixed(1)) : 200,
        accruedProfit: inv.accruedProfit.toNumber(),
        status: inv.status.toLowerCase(),
        date: inv.createdAt.toISOString(),
      }));

      const subscriptionItem = {
        ref: `INV-${investment.id.slice(0, 8).toUpperCase()}`,
        plan: investment.plan.name,
        duration: investment.plan.durationDays,
        daysLeft: investment.daysRemaining,
        amount: investment.amount.toNumber(),
        roi: totalRoi,
        status: investment.status.toLowerCase(),
        date: investment.createdAt.toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: `Successfully subscribed $${subAmount.toLocaleString()} to ${investment.plan.name}!`,
        newBalance,
        subscription: subscriptionItem,
        history,
      });
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Subscription purchase error:", error);
    return NextResponse.json({ error: error.message || "Failed to subscribe" }, { status: 500 });
  }
}
