export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { closePositionAndSettle } from "@/lib/trade-settlement";
import { getTradeConfig, setTradeConfig, deleteTradeConfig } from "@/lib/trade-config";
import { adminTradeActionSchema } from "@/lib/schemas";
import { atomic, debitMain, insertTransaction, money, InsufficientFundsError } from "@/lib/ledger";
import { getVerifiedPrice } from "@/lib/prices";

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

    const parsed = adminTradeActionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid trade action" }, { status: 400 });
    }
    const body = parsed.data;
    const { action } = body;

    // Explicit Close action by Admin
    if (action === "close") {
      const { positionId, pnl } = body;
      const overridePnlVal = pnl;
      const res = await closePositionAndSettle({
        positionId,
        overridePnl: overridePnlVal,
        closedByAdmin: true,
      });
      return NextResponse.json(res);
    }

    if (action === "update") {
      const { positionId, pnl, status } = body;
      const current = await prisma.position.findUnique({ where: { id: positionId } });
      if (!current) return NextResponse.json({ error: "Position not found" }, { status: 404 });
      if (current.status !== "OPEN") {
        return NextResponse.json({ error: "Closed positions are immutable" }, { status: 409 });
      }

      // If status requested is CLOSED, execute full financial settlement
      if (status === "CLOSED") {
        const overridePnlVal = pnl;
        const res = await closePositionAndSettle({
          positionId,
          overridePnl: overridePnlVal,
          closedByAdmin: true,
        });
        return NextResponse.json(res);
      }

      // If trade remains OPEN, save custom profit/PnL so investor sees it and it settles with this PnL
      if (typeof pnl === "number") {
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
      const { userId, symbol, type, amount, leverage, status, pnl } = body;
      const livePrice = await getVerifiedPrice(symbol);
      if (!livePrice) return NextResponse.json({ error: "A recent verified market price is unavailable" }, { status: 503 });
      const requiredMargin = money(amount / leverage);
      const created = await atomic(async (tx) => {
        await debitMain(tx, userId, requiredMargin, {
          referenceType: "ADMIN_TRADE_CREATE",
          counterAccount: "PLATFORM:TRADE_MARGIN",
        });
        const position = await tx.position.create({
          data: { userId, symbol, type, amount, entryPrice: livePrice, leverage, status, pnl: pnl || 0 },
        });
        await insertTransaction(tx, {
          userId,
          type: `TRADE_${type}`,
          amount,
          currency: symbol,
          status: "APPROVED",
          txHash: `ADMIN_ORD_${position.id.slice(0, 8).toUpperCase()}`,
        });
        return position;
      });
      return NextResponse.json({ success: true, position: created });
    }

    if (action === "delete") {
      const { positionId } = body;
      const current = await prisma.position.findUnique({ where: { id: positionId }, select: { status: true } });
      if (!current) return NextResponse.json({ error: "Position not found" }, { status: 404 });
      if (current.status !== "CLOSED") {
        return NextResponse.json({ error: "Open positions must be closed and settled before deletion" }, { status: 409 });
      }
      await deleteTradeConfig(positionId);
      await prisma.position.delete({
        where: { id: positionId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      return NextResponse.json({ error: "The selected user has insufficient margin" }, { status: 400 });
    }
    console.error("Admin trades action error:", error);
    return NextResponse.json({ error: "Failed action" }, { status: 500 });
  }
}
