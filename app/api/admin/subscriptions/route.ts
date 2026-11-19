export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCatalogPlans } from "@/lib/relational-catalogs";

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  title: string;
  minimum: number;
  maximum: number;
  duration: number;
  roi: number;
  placeholder?: number;
}

const DEFAULT_PLANS: AdminSubscriptionPlan[] = [
  {
    id: "Starter1234",
    name: "Starter",
    title: "Starter plan",
    minimum: 11000,
    maximum: 19500,
    duration: 3,
    roi: 200,
  },
  {
    id: "Lite1234",
    name: "Lite",
    title: "Lite plan",
    minimum: 20000,
    maximum: 49500,
    duration: 3,
    roi: 300,
  },
  {
    id: "Classic1234",
    name: "Classic",
    title: "Classic plan",
    minimum: 50000,
    maximum: 99500,
    duration: 3,
    roi: 350,
  },
  {
    id: "Pro1234",
    name: "Pro",
    title: "Pro plan",
    minimum: 100000,
    maximum: 1000000,
    duration: 3,
    roi: 403,
  },
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await getCatalogPlans();

    // 2. Active investments / subscriptions from prisma.investment
    const investments = await prisma.investment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
          },
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        plans,
        investments: investments.map((inv) => ({
          id: inv.id,
          userId: inv.userId,
          userEmail: inv.user?.email || "Unknown",
          userFullName: inv.user?.fullName || inv.user?.username || "Investor",
          planName: inv.plan?.name || "Subscription",
          amount: Number(inv.amount),
          accruedProfit: Number(inv.accruedProfit),
          daysRemaining: inv.daysRemaining,
          status: inv.status,
          createdAt: inv.createdAt.toISOString(),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch admin subscriptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, plan, planId, investmentId, newStatus } = body;

    // A. Save plan
    if (action === "savePlan") {
      if (!plan?.id || !plan?.name) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      const duration = Math.max(1, Number(plan.duration));
      await prisma.plan.upsert({ where: { id: plan.id }, update: { name: plan.name, title: plan.title, minDeposit: Number(plan.minimum), maxDeposit: Number(plan.maximum), durationDays: duration, dailyRoiPercentage: Number(plan.roi) / duration, placeholder: Number(plan.placeholder ?? plan.minimum), isActive: true }, create: { id: plan.id, name: plan.name, title: plan.title, minDeposit: Number(plan.minimum), maxDeposit: Number(plan.maximum), durationDays: duration, dailyRoiPercentage: Number(plan.roi) / duration, placeholder: Number(plan.placeholder ?? plan.minimum), isActive: true } });
      const updatedPlans = await getCatalogPlans();
      return NextResponse.json({ success: true, plans: updatedPlans });
    }

    // B. Delete plan
    if (action === "deletePlan") {
      await prisma.plan.updateMany({ where: { id: planId }, data: { isActive: false } });
      const updatedPlans = await getCatalogPlans();
      return NextResponse.json({ success: true, plans: updatedPlans });
    }

    // C. Update user investment status
    if (action === "updateInvestmentStatus") {
      if (!investmentId || !newStatus) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const updated = await prisma.investment.update({
        where: { id: investmentId },
        data: { status: newStatus },
      });
      return NextResponse.json({ success: true, investment: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin subscriptions action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
