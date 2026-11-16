export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { closePositionAndSettle } from "@/lib/trade-settlement";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: positionId } = await params;

    const pos = await prisma.position.findFirst({ where: { id: positionId, userId: session.userId } });
    if (!pos) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }
    if (pos.status === "CLOSED") {
      return NextResponse.json({ error: "Position is already closed" }, { status: 400 });
    }

    const result = await closePositionAndSettle({ positionId });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Close position error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
