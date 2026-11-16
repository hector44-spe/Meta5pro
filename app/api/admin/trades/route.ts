export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { closePositionAndSettle } from "@/lib/trade-settlement";
import { getTradeConfig, setTradeConfig, deleteTradeConfig } from "@/lib/trade-config";

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

    const enriched = await Promise.all(
      positions.map(async (p) => {
        const config = await getTradeConfig(p.id);
        return {
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
          duration: config?.duration || null,
          closeAt: config?.closeAt || null,
          customPnl: config?.customPnl ?? null,
          isCustomPnl: Boolean(config?.isCustomPnl),
          closedAt: p.closedAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        positions: enriched,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
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

    // Explicit Close action by Admin
    if (action === "close") {
      if (!positionId) {
        return NextResponse.json({ error: "Missing positionId" }, { status: 400 });
      }
      const overridePnlVal = typeof pnl === "number" && !isNaN(pnl) ? pnl : undefined;
      const res = await closePositionAndSettle({
        positionId,
        overridePnl: overridePnlVal,
        closedByAdmin: true,
      });
      return NextResponse.json(res);
    }

    if (action === "update") {
      if (!positionId) {
        return NextResponse.json({ error: "Missing positionId" }, { status: 400 });
      }

      // If status requested is CLOSED, execute full financial settlement
      if (status === "CLOSED") {
        const overridePnlVal = typeof pnl === "number" && !isNaN(pnl) ? pnl : undefined;
        const res = await closePositionAndSettle({
          positionId,
          overridePnl: overridePnlVal,
          closedByAdmin: true,
        });
        return NextResponse.json(res);
      }

      // If trade remains OPEN, save custom profit/PnL so investor sees it and it settles with this PnL
      if (typeof pnl === "number" && !isNaN(pnl)) {
        await setTradeConfig(positionId, {
          isCustomPnl: true,
          customPnl: pnl,
        });
        const updated = await prisma.position.update({
          where: { id: positionId },
          data: { pnl },
        });
        return NextResponse.json({ success: true, position: updated, message: `Profit updated to $${pnl.toFixed(2)}` });
      }

      const updated = await prisma.position.update({
        where: { id: positionId },
        data: {
          ...(status ? { status } : {}),
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
      await deleteTradeConfig(positionId);
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
