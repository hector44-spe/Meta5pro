export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const action = body.action as "approve" | "reject";

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const stmtTx = sqlite.prepare("SELECT * FROM transactions WHERE id = ?");
    const tx: any = stmtTx.get(id);

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (tx.status !== "PENDING") {
      return NextResponse.json(
        { error: `Transaction is already ${tx.status}` },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const wallet = await db.wallet.findUnique({ where: { userId: tx.userId } });

    if (action === "approve") {
      if (tx.type === "DEPOSIT") {
        if (wallet) {
          await db.wallet.update({
            where: { userId: tx.userId },
            data: {
              mainBalance: wallet.mainBalance + Number(tx.amount),
              totalDeposited: wallet.totalDeposited + Number(tx.amount),
            },
          });
        }
      } else if (tx.type === "WITHDRAWAL") {
        if (wallet) {
          await db.wallet.update({
            where: { userId: tx.userId },
            data: {
              totalWithdrawn: wallet.totalWithdrawn + Number(tx.amount),
            },
          });
        }
      }

      await db.transaction.update({
        where: { id },
        data: { status: "APPROVED", approvedAt: now },
      });
    } else {
      // Reject
      if (tx.type === "WITHDRAWAL") {
        // Refund hold balance
        if (wallet) {
          await db.wallet.update({
            where: { userId: tx.userId },
            data: {
              mainBalance: wallet.mainBalance + Number(tx.amount),
            },
          });
        }
      }

      await db.transaction.update({
        where: { id },
        data: { status: "REJECTED", approvedAt: now },
      });
    }

    return NextResponse.json({
      success: true,
      id,
      action,
      status: action === "approve" ? "APPROVED" : "REJECTED",
    });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
