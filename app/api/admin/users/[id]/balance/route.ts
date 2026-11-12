export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const balanceSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  action: z.enum(["credit", "debit"]),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const parsed = balanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { amount, action, note } = parsed.data;

    // Check user & wallet
    const user = await db.user.findUnique({ where: { id: userId }, include: { wallet: true } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = user.wallet?.mainBalance || 0.0;
    let newBalance = currentBalance;

    if (action === "credit") {
      newBalance = currentBalance + amount;
    } else {
      if (currentBalance < amount) {
        return NextResponse.json(
          { error: `Insufficient user balance to debit $${amount}. Current balance: $${currentBalance}` },
          { status: 400 }
        );
      }
      newBalance = currentBalance - amount;
    }

    // Update wallet
    const updatedWallet = await db.wallet.update({
      where: { userId },
      data: { mainBalance: newBalance },
    });

    // Record audit log
    const now = new Date().toISOString();
    sqlite.prepare(`
      INSERT INTO activity_logs (id, userId, action, ipAddress, details, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "log_" + Math.random().toString(36).substring(2, 9),
      userId,
      `ADMIN_BALANCE_${action.toUpperCase()}`,
      "127.0.0.1",
      `Admin ${action}ed $${amount}. Note: ${note || "Manual balance correction"}`,
      now
    );

    return NextResponse.json({
      success: true,
      message: `User balance ${action}ed by $${amount}. New balance: $${newBalance.toFixed(2)}`,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Admin balance adjustment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
