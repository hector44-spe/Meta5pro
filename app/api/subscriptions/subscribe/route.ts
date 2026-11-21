import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";
import { subscriptionPurchaseSchema } from "@/lib/schemas";

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
    if (session.status === "FROZEN") {
      return NextResponse.json(
        { error: "Your account is frozen. Subscriptions are disabled." },
        { status: 403 },
      );
    }

    const parsed = subscriptionPurchaseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid subscription" }, { status: 400 });
    }
    const { planId, amount } = parsed.data;
    const subAmount = money(amount);
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Selected plan is unavailable" }, { status: 404 });
    }
    if (subAmount < plan.minDeposit.toNumber() || subAmount > plan.maxDeposit.toNumber()) {
      return NextResponse.json(
        { error: `Investment must be between $${plan.minDeposit.toNumber()} and $${plan.maxDeposit.toNumber()}` },
        { status: 400 },
      );
    }

    try {
      const { newBalance, investment } = await atomic(async (tx) => {
        // 2. Atomically debit user balance
        const newBalance = await debitMain(tx, session.userId, subAmount, {
          referenceType: "INVESTMENT_SUBSCRIBE",
          referenceId: plan.id,
          counterAccount: `INVESTMENT_PLAN:${plan.id}`,
        });

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
        roi: Number((investment.plan.dailyRoiPercentage.toNumber() * investment.plan.durationDays).toFixed(1)),
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
