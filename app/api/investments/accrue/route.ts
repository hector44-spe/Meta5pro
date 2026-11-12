export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    // Find all RUNNING investments
    const stmt = sqlite.prepare(`
      SELECT 
        i.id, i.userId, i.planId, i.amount, i.accruedProfit, i.daysRemaining, i.status,
        p.dailyRoiPercentage, p.durationDays, p.capitalRefund
      FROM investments i
      JOIN plans p ON i.planId = p.id
      WHERE i.status = 'RUNNING' AND i.daysRemaining > 0
    `);
    const running = stmt.all() as any[];

    let totalYieldDistributed = 0;
    const now = new Date().toISOString();

    for (const inv of running) {
      const dailyYield = Number(inv.amount) * (Number(inv.dailyRoiPercentage) / 100);
      totalYieldDistributed += dailyYield;

      const newAccrued = Number(inv.accruedProfit) + dailyYield;
      const newDaysRemaining = Number(inv.daysRemaining) - 1;
      const isCompleted = newDaysRemaining <= 0;
      const newStatus = isCompleted ? "COMPLETED" : "RUNNING";

      // 1. Update investment record
      sqlite.prepare(`
        UPDATE investments
        SET accruedProfit = ?, daysRemaining = ?, status = ?, lastPayoutAt = ?
        WHERE id = ?
      `).run(newAccrued, newDaysRemaining, newStatus, now, inv.id);

      // 2. Credit yield to investor's interestBalance
      sqlite.prepare(`
        UPDATE wallets
        SET interestBalance = interestBalance + ?, updatedAt = ?
        WHERE userId = ?
      `).run(dailyYield, now, inv.userId);

      // 3. If completed and capital refund is enabled, return capital to mainBalance
      if (isCompleted && inv.capitalRefund === 1) {
        sqlite.prepare(`
          UPDATE wallets
          SET mainBalance = mainBalance + ?, updatedAt = ?
          WHERE userId = ?
        `).run(Number(inv.amount), now, inv.userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed daily yields for ${running.length} active investments. Total distributed: $${totalYieldDistributed.toFixed(2)}`,
      processedCount: running.length,
      totalYieldDistributed,
    });
  } catch (error) {
    console.error("Accrue daily yields error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
