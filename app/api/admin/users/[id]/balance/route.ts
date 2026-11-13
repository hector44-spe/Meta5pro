export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { atomic, audit, creditMain, debitMain, InsufficientFundsError } from "@/lib/ledger";
import { z } from "zod";

const balanceSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  action: z.enum(["credit", "debit"]),
  note: z.string().max(500).optional(),
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
    const parsed = balanceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { amount, action, note } = parsed.data;

    const exists = await prisma.wallet.findUnique({ where: { userId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ip = clientIp(req);
    try {
      const newBalance = await atomic(async (tx) => {
        const balance = action === "credit"
          ? await creditMain(tx, userId, amount)
          : await debitMain(tx, userId, amount);
        await audit(
          tx,
          userId,
          `ADMIN_BALANCE_${action.toUpperCase()}`,
          ip,
          `Admin ${session.userId} (${session.email}) ${action}ed $${amount}. Note: ${note || "Manual balance correction"}`,
        );
        return balance;
      });

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      return NextResponse.json({
        success: true,
        message: `User balance ${action}ed by $${amount}. New balance: $${newBalance.toFixed(2)}`,
        wallet,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient user balance to debit $${amount}. Current balance: $${e.available.toFixed(2)}` },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Admin balance adjustment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
