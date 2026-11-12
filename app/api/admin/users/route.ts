export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const stmt = sqlite.prepare(`
      SELECT 
        u.id, u.email, u.username, u.fullName, u.phoneNumber, u.role, u.status, u.createdAt,
        COALESCE(w.mainBalance, 0.0) as mainBalance,
        COALESCE(w.interestBalance, 0.0) as interestBalance,
        COALESCE(w.totalDeposited, 0.0) as totalDeposited,
        COALESCE(w.totalWithdrawn, 0.0) as totalWithdrawn
      FROM users u
      LEFT JOIN wallets w ON u.id = w.userId
      ORDER BY u.createdAt DESC
    `);
    const users = stmt.all();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
