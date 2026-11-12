export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const subscribeSchema = z.object({
  planId: z.string().min(1, "Plan selection is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { planId, amount } = parsed.data;

    // 1. Verify plan exists
    const plans = await db.plan.findMany();
    const plan = plans.find((p) => p.id === planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Selected investment plan is invalid or inactive" }, { status: 404 });
    }

    // 2. Verify deposit bounds
    if (amount < plan.minDeposit) {
      return NextResponse.json(
        { error: `Minimum investment for ${plan.name} is $${plan.minDeposit.toLocaleString()}` },
        { status: 400 }
      );
    }
    if (amount > plan.maxDeposit) {
      return NextResponse.json(
        { error: `Maximum investment for ${plan.name} is $${plan.maxDeposit.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 3. Verify user wallet
    const wallet = await db.wallet.findUnique({ where: { userId: session.userId } });
    const currentBalance = wallet?.mainBalance || 0.0;
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}` },
        { status: 400 }
      );
    }

    // 4. Deduct capital from wallet
    const newBalance = currentBalance - amount;
    await db.wallet.update({
      where: { userId: session.userId },
      data: { mainBalance: newBalance },
    });

    // 5. Create active investment
    const investment = await db.investment.create({
      data: {
        userId: session.userId,
        planId: plan.id,
        amount,
        daysRemaining: plan.durationDays,
      },
    });

    // 6. Record transaction history
    await db.transaction.create({
      data: {
        userId: session.userId,
        type: "INVESTMENT_SUBSCRIBE",
        amount,
        currency: "USD",
        txHash: `STAKE_${investment.id.substring(3, 11).toUpperCase()}`,
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed $${amount.toLocaleString()} to ${plan.name}! Daily ROI: ${plan.dailyRoiPercentage}%`,
      investment,
      newBalance,
    });
  } catch (error) {
    console.error("Investment subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
