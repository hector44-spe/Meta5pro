export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** GET: List user's cold storage assets from database */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.coldStorageAsset.findMany({
      where: { userId: session.userId, amount: { gt: 0 } },
    });

    const assets = rows.map((r) => ({
      symbol: r.symbol,
      amount: r.amount.toNumber(),
    }));

    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error("Fetch cold storage assets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
