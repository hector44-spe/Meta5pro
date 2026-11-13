export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { atomic, addWithdrawn, audit, creditMain, settlePending } from "@/lib/ledger";
import { sendTransactionStatusEmail } from "@/lib/mail";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const action = body.action as "approve" | "reject";

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";
    const ip = clientIp(req);
    const amount = tx.amount.toNumber();

    const settled = await atomic(async (t) => {
      // Only one request can move PENDING -> final, so a deposit can't be credited twice.
      if (!(await settlePending(t, id, status))) return false;

      if (action === "approve") {
        if (tx.type === "DEPOSIT") await creditMain(t, tx.userId, amount, { deposited: true });
        else if (tx.type === "WITHDRAWAL") await addWithdrawn(t, tx.userId, amount);
      } else if (tx.type === "WITHDRAWAL") {
        // Funds were held when the request was made; give them back.
        await creditMain(t, tx.userId, amount);
      }

      await audit(
        t,
        tx.userId,
        `ADMIN_${tx.type}_${status}`,
        ip,
        `Admin ${session.userId} (${session.email}) ${status.toLowerCase()} ${tx.type.toLowerCase()} ${id} for $${amount}`,
      );
      return true;
    });

    if (!settled) {
      const current = await prisma.transaction.findUnique({ where: { id }, select: { status: true } });
      return NextResponse.json(
        { error: `Transaction is already ${current?.status ?? "settled"}` },
        { status: 400 },
      );
    }

    if (tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL") {
      const owner = await prisma.user.findUnique({ where: { id: tx.userId }, select: { email: true } });
      if (owner) {
        await sendTransactionStatusEmail(owner.email, { type: tx.type, status, amount, currency: tx.currency });
      }
    }

    return NextResponse.json({ success: true, id, action, status });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
