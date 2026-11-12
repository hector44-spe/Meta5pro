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
      SELECT * FROM positions
      WHERE userId = ?
      ORDER BY createdAt DESC
    `);
    const positions = stmt.all(session.userId);

    return NextResponse.json({
      success: true,
      positions,
    });
  } catch (error) {
    console.error("Fetch positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
