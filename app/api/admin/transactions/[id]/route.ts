export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { atomic, addWithdrawn, audit, creditMain, settlePending } from "@/lib/ledger";
import { sendTransactionStatusEmail } from "@/lib/mail";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";

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
      const ref = tx.id.slice(0, 8).toUpperCase();
      const what = tx.assetSymbol && tx.assetAmount ? `${fmtUnits(tx.assetAmount.toNumber(), tx.assetSymbol)} (${fmtUsd(amount)})` : fmtUsd(amount);
      const text =
        tx.type === "DEPOSIT"
          ? status === "APPROVED"
            ? ["Deposit confirmed", `Your deposit of ${what} has been confirmed and ${fmtUsd(amount)} was added to your balance. Reference ${ref}.`]
            : ["Deposit not approved", `Your deposit of ${what} could not be confirmed. Reference ${ref}. Contact support if you believe this is a mistake.`]
          : status === "APPROVED"
            ? ["Withdrawal sent", `Your withdrawal of ${what} has been approved and sent to ${tx.cryptoAddress ?? "your address"}. Reference ${ref}.`]
            : ["Withdrawal rejected", `Your withdrawal of ${what} was rejected and ${fmtUsd(amount)} was returned to your balance. Reference ${ref}.`];
      await notify(tx.userId, tx.type === "DEPOSIT" ? "deposit" : "withdrawal", text[0], text[1]);

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
