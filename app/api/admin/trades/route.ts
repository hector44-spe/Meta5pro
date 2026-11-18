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
import { getCatalogExperts } from "@/lib/relational-catalogs";

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
          fundingAsset: p.fundingAsset,
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
          source: config?.source || "DIRECT",
          copyExpertId: config?.copyExpertId || null,
          copyExpertName: config?.copyExpertName || null,
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

    if (action === "createCopyTrade") {
      const { expertId, symbol, fundingAsset, type, amount, leverage, pnl } = body;
      const marketSymbol = symbol.split("/")[0];
      const experts = await getCatalogExperts();
      const expert = experts.find((item) => item.id === expertId || item.ref === expertId);
      if (!expert) return NextResponse.json({ error: "Expert trader not found" }, { status: 404 });

      const subscriberIds = [...new Set((expert.subscriberList ?? []).filter(Boolean))];
      if (subscriberIds.length === 0) {
        return NextResponse.json({ error: "This expert has no active copiers" }, { status: 409 });
      }
      const activeSubscribers = await prisma.user.findMany({
        where: { id: { in: subscriberIds }, status: "ACTIVE" },
        select: { id: true, email: true, wallet: { select: { mainBalance: true } } },
      });
      if (activeSubscribers.length === 0) {
        return NextResponse.json({ error: "This expert has no active copiers" }, { status: 409 });
      }
      const livePrice = await getVerifiedPrice(marketSymbol);
      if (!livePrice) return NextResponse.json({ error: "A recent verified market price is unavailable" }, { status: 503 });
      const requiredMargin = money(amount / leverage);
      const initialPnl = money(pnl ?? 0);
      const eligibleSubscribers = activeSubscribers.filter(
        (user) => user.wallet && Number(user.wallet.mainBalance) >= requiredMargin,
      );
      const failed: Array<{ email: string; reason: string }> = activeSubscribers
        .filter((user) => !user.wallet || Number(user.wallet.mainBalance) < requiredMargin)
        .map((user) => ({
          email: user.email,
          reason: !user.wallet
            ? "no trading wallet is available"
            : `available balance is $${Number(user.wallet.mainBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        }));

      // Keep each copier atomic, but do not roll back successful copier accounts
      // because a different account changed balance between validation and debit.
      const created = [];
      for (const user of eligibleSubscribers) {
        try {
          const position = await prisma.$transaction(async (tx) => {
            await debitMain(tx, user.id, requiredMargin, {
              referenceType: "COPY_TRADE_CREATE",
              referenceId: expertId,
              counterAccount: "PLATFORM:TRADE_MARGIN",
            });
            const position = await tx.position.create({
              data: { userId: user.id, symbol: marketSymbol, fundingAsset: fundingAsset || marketSymbol, type, amount, entryPrice: livePrice, leverage, status: "OPEN", pnl: initialPnl },
            });
            await insertTransaction(tx, {
              userId: user.id,
              type: `TRADE_${type}`,
              amount,
              currency: marketSymbol,
              status: "APPROVED",
              txHash: `COPY_ORD_${position.id.slice(0, 8).toUpperCase()}`,
            });
            await tx.notification.create({
              data: {
                userId: user.id,
                kind: "trade",
                title: "Copied trade opened",
                body: `${expert.name || "Your expert"} opened a ${type.toLowerCase()} position on ${marketSymbol}. Margin held: $${requiredMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
              },
            });
            return position;
          }, { maxWait: 10_000, timeout: 30_000 });
          created.push(position);
        } catch (error) {
          const reason = error instanceof InsufficientFundsError
            ? `available balance is $${error.available.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : "the account could not be updated";
          failed.push({ email: user.email, reason });
          console.error("Create copied trade for copier failed:", { userId: user.id, expertId, error });
        }
      }

      if (created.length === 0) {
        const detail = failed[0]
          ? ` ${failed[0].email}: ${failed[0].reason}.`
          : "";
        return NextResponse.json({
          error: `No copied trades could be opened.${detail}`,
        }, { status: 409 });
      }

      await Promise.all(created.map((position) => setTradeConfig(position.id, {
        source: "COPY_TRADING",
        copyExpertId: expertId,
        copyExpertName: expert.name || "Expert trader",
      })));

      return NextResponse.json({
        success: true,
        positions: created,
        createdCount: created.length,
        failedCount: failed.length,
        failures: failed,
        message: failed.length > 0
          ? `Trade opened for ${created.length} copier${created.length === 1 ? "" : "s"}; ${failed.length} account${failed.length === 1 ? " was" : "s were"} skipped.`
          : `Trade opened for ${created.length} active copier${created.length === 1 ? "" : "s"}.`,
      });
    }

    // Explicit Close action by Admin
    if (action === "close") {
      const { positionId, pnl, fundingAsset } = body;
      const overridePnlVal = pnl;
      const res = await closePositionAndSettle({
        positionId,
        overridePnl: overridePnlVal,
        fundingAssetOverride: fundingAsset,
        closedByAdmin: true,
      });
      return NextResponse.json(res);
    }

    if (action === "update") {
      const { positionId, pnl, status, fundingAsset } = body;
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
          fundingAssetOverride: fundingAsset,
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
          data: { pnl, ...(fundingAsset ? { fundingAsset } : {}) },
        });
        return NextResponse.json({ success: true, position: updated, message: `Profit updated to $${pnl.toFixed(2)}` });
      }

      const updated = await prisma.position.update({
        where: { id: positionId },
        data: {
          ...(status ? { status } : {}),
          ...(fundingAsset ? { fundingAsset } : {}),
        },
      });
      return NextResponse.json({ success: true, position: updated });
    }

    if (action === "create") {
      const { userId, symbol, fundingAsset, type, amount, leverage, status, pnl } = body;
      const livePrice = await getVerifiedPrice(symbol);
      if (!livePrice) return NextResponse.json({ error: "A recent verified market price is unavailable" }, { status: 503 });
      const requiredMargin = money(amount / leverage);
      const created = await atomic(async (tx) => {
        await debitMain(tx, userId, requiredMargin, {
          referenceType: "ADMIN_TRADE_CREATE",
          counterAccount: "PLATFORM:TRADE_MARGIN",
        });
        const position = await tx.position.create({
          data: { userId, symbol, fundingAsset: fundingAsset || symbol, type, amount, entryPrice: livePrice, leverage, status, pnl: pnl || 0 },
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
      return NextResponse.json({ error: "One or more selected accounts have insufficient margin" }, { status: 400 });
    }
    console.error("Admin trades action error:", error);
    return NextResponse.json({ error: "Failed action" }, { status: 500 });
  }
}
