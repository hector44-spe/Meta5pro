export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.investment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { name: true, dailyRoiPercentage: true, durationDays: true, capitalRefund: true } } },
    });
    const investments = rows.map(({ plan, ...i }) => ({
      ...i,
      planName: plan.name,
      dailyRoiPercentage: plan.dailyRoiPercentage,
      durationDays: plan.durationDays,
      capitalRefund: plan.capitalRefund,
    }));

    return NextResponse.json({
      success: true,
      investments,
    });
  } catch (error) {
    console.error("Fetch user investments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
