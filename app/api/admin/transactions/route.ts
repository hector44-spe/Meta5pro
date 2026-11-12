export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Join transactions with user email/fullName
    const stmt = sqlite.prepare(`
      SELECT 
        t.id, t.userId, t.type, t.amount, t.currency, t.cryptoAddress, t.txHash, t.receiptUrl, t.status, t.createdAt,
        u.email as userEmail, u.fullName as userFullName
      FROM transactions t
      LEFT JOIN users u ON t.userId = u.id
      ORDER BY t.createdAt DESC
    `);
    const transactions = stmt.all();

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Admin transactions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
