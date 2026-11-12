export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stmt = sqlite.prepare(`
      SELECT 
        i.id, i.userId, i.planId, i.amount, i.accruedProfit, i.daysRemaining, i.status, i.lastPayoutAt, i.createdAt,
        p.name as planName, p.dailyRoiPercentage, p.durationDays, p.capitalRefund
      FROM investments i
      LEFT JOIN plans p ON i.planId = p.id
      WHERE i.userId = ?
      ORDER BY i.createdAt DESC
    `);
    const investments = stmt.all(session.userId);

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
