export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, InsufficientFundsError } from "@/lib/ledger";
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

    const parsed = subscribeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { planId, amount } = parsed.data;

    // 1. Verify plan exists
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Selected investment plan is invalid or inactive" }, { status: 404 });
    }

    // 2. Verify deposit bounds
    const minDeposit = plan.minDeposit.toNumber();
    const maxDeposit = plan.maxDeposit.toNumber();
    if (amount < minDeposit) {
      return NextResponse.json(
        { error: `Minimum investment for ${plan.name} is $${minDeposit.toLocaleString()}` },
        { status: 400 }
      );
    }
    if (amount > maxDeposit) {
      return NextResponse.json(
        { error: `Maximum investment for ${plan.name} is $${maxDeposit.toLocaleString()}` },
        { status: 400 }
      );
    }

    try {
      // 3. Debit, create the investment and record history in one transaction
      const { investment, newBalance } = await atomic(async (tx) => {
        const newBalance = await debitMain(tx, session.userId, amount);
        const investment = await tx.investment.create({
          data: {
            userId: session.userId,
            planId: plan.id,
            amount,
            daysRemaining: plan.durationDays,
          },
        });
        await insertTransaction(tx, {
          userId: session.userId,
          type: "INVESTMENT_SUBSCRIBE",
          amount,
          currency: "USD",
          txHash: `STAKE_${investment.id.substring(0, 8).toUpperCase()}`,
          status: "APPROVED",
        });
        return { investment, newBalance };
      });

      return NextResponse.json({
        success: true,
        message: `Successfully subscribed $${amount.toLocaleString()} to ${plan.name}! Daily ROI: ${plan.dailyRoiPercentage.toNumber()}%`,
        investment,
        newBalance,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient balance. Available: $${e.available.toFixed(2)}, Required: $${amount.toFixed(2)}` },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Investment subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
