export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";
import { realEstateInvestmentSchema } from "@/lib/schemas";
import { OPEN_REAL_ESTATE_PROJECTS, type RealEstateProject } from "@/data/realEstateData";

function projectDurationMonths(project: RealEstateProject): number {
  const value = project.minDuration || 12;
  if (project.minDurationUnit === "YEAR") return value * 12;
  if (project.minDurationUnit === "WEEK") return Math.max(1, Math.ceil((value * 7) / 30));
  if (project.minDurationUnit === "DAY") return Math.max(1, Math.ceil(value / 30));
  return value;
}

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
    if (session.status === "FROZEN") {
      return NextResponse.json(
        { error: "Your account is frozen. Real estate investments are disabled." },
        { status: 403 },
      );
    }

    const parsed = realEstateInvestmentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { projectId, amount } = parsed.data;
    const invAmount = money(amount);
    const setting = await prisma.appSetting.findUnique({ where: { key: "real_estate_projects" } });
    const projects = setting && Array.isArray(setting.value)
      ? setting.value as unknown as RealEstateProject[]
      : OPEN_REAL_ESTATE_PROJECTS;
    const project = projects.find((item) => item.id === projectId);
    if (!project || project.status !== "open" || project.closedByDefault) {
      return NextResponse.json({ error: "Selected project is not open for investment" }, { status: 404 });
    }
    if (invAmount < project.minimum) {
      return NextResponse.json({ error: `Minimum investment is ${fmtUsd(project.minimum)}` }, { status: 400 });
    }
    const durationMonths = projectDurationMonths(project);

    try {
      const { investment, newBalance } = await atomic(async (tx) => {
        // 1. Debit wallet
        const newBalance = await debitMain(tx, session.userId, invAmount, {
          referenceType: "REAL_ESTATE_INVEST",
          referenceId: project.id,
          counterAccount: `REAL_ESTATE:${project.id}`,
        });

        // 2. Create investment record
        const investment = await tx.realEstateInvestment.create({
          data: {
            userId: session.userId,
            projectId,
            projectTitle: project.title,
            thumbnail: project.thumbnail || null,
            amount: invAmount,
            roi: project.roi,
            strategy: project.strategy,
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
        `${fmtUsd(invAmount)} invested in ${project.title} (${project.roi}% target ROI, ${durationMonths} months).`,
      );

      return NextResponse.json({
        success: true,
        message: `Successfully invested $${invAmount.toLocaleString()} in ${project.title}!`,
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
