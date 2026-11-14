export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const positions = await prisma.position.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      positions: positions.map((p) => ({
        id: p.id,
        userId: p.userId,
        userEmail: p.user?.email || null,
        userFullName: p.user?.fullName || null,
        username: p.user?.username || null,
        symbol: p.symbol,
        type: p.type,
        amount: Number(p.amount),
        entryPrice: Number(p.entryPrice),
        leverage: p.leverage,
        status: p.status,
        pnl: Number(p.pnl),
        closedAt: p.closedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Fetch admin trades error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, positionId, pnl, status, userId, symbol, type, amount, entryPrice, leverage } = body;

    if (action === "update") {
      const updated = await prisma.position.update({
        where: { id: positionId },
        data: {
          ...(typeof pnl === "number" ? { pnl } : {}),
          ...(status ? { status } : {}),
          ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
        },
      });
      return NextResponse.json({ success: true, position: updated });
    }

    if (action === "create") {
      if (!userId || !symbol || !amount) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const created = await prisma.position.create({
        data: {
          userId,
          symbol: String(symbol).toUpperCase(),
          type: type || "BUY",
          amount: Number(amount),
          entryPrice: Number(entryPrice || 1),
          leverage: Number(leverage || 1),
          status: status || "OPEN",
          pnl: Number(pnl || 0),
        },
      });
      return NextResponse.json({ success: true, position: created });
    }

    if (action === "delete") {
      await prisma.position.delete({
        where: { id: positionId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin trades action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
