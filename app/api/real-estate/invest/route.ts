export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";
import { z } from "zod";

const investSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  projectTitle: z.string().min(1, "Project Title is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  roi: z.number().nonnegative(),
  strategy: z.string().default("Rental Income"),
  durationMonths: z.number().int().min(1).default(12),
  thumbnail: z.string().optional().nullable(),
});

/** GET: List current user's real estate investments from database */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investments = await prisma.realEstateInvestment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = investments.map((inv) => ({
      id: inv.id,
      projectId: inv.projectId,
      projectTitle: inv.projectTitle,
      thumbnail: inv.thumbnail || "",
      amount: inv.amount.toNumber(),
      roi: inv.roi.toNumber(),
      strategy: inv.strategy,
      durationMonths: inv.durationMonths,
      status: inv.status,
      startDate: inv.startDate.toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, investments: formatted });
  } catch (error) {
    console.error("Fetch user real estate investments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST: Create a real estate investment, atomically debiting wallet */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = investSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { projectId, projectTitle, amount, roi, strategy, durationMonths, thumbnail } = parsed.data;
    const invAmount = money(amount);

    try {
      const { investment, newBalance } = await atomic(async (tx) => {
        // 1. Debit wallet
        const newBalance = await debitMain(tx, session.userId, invAmount);

        // 2. Create investment record
        const investment = await tx.realEstateInvestment.create({
          data: {
            userId: session.userId,
            projectId,
            projectTitle,
            thumbnail: thumbnail || null,
            amount: invAmount,
            roi,
            strategy,
            durationMonths,
            status: "ACTIVE",
          },
        });

        // 3. Record transaction
        await insertTransaction(tx, {
          userId: session.userId,
          type: "REAL_ESTATE_INVEST",
          amount: invAmount,
          currency: "USD",
          txHash: `RE_${investment.id.substring(0, 8).toUpperCase()}`,
          status: "APPROVED",
        });

        return { investment, newBalance };
      });

      await notify(
        session.userId,
        "investment",
        "Real estate investment confirmed",
        `${fmtUsd(invAmount)} invested in ${projectTitle} (${roi}% target ROI, ${durationMonths} months).`,
      );

      return NextResponse.json({
        success: true,
        message: `Successfully invested $${invAmount.toLocaleString()} in ${projectTitle}!`,
        investment: {
          id: investment.id,
          projectId: investment.projectId,
          projectTitle: investment.projectTitle,
          thumbnail: investment.thumbnail || "",
          amount: investment.amount.toNumber(),
          roi: investment.roi.toNumber(),
          strategy: investment.strategy,
          durationMonths: investment.durationMonths,
          status: investment.status,
          startDate: investment.startDate.toISOString().split("T")[0],
        },
        newBalance,
      });
    } catch (err) {
      if (err instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient wallet balance. Required: $${invAmount.toFixed(2)}, Available: $${err.available.toFixed(2)}` },
          { status: 400 },
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Real estate investment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
