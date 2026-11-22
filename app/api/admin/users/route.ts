export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPrices } from "@/lib/prices";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const [rows, deposits, withdrawals, assetBalances, priceSnapshot] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, username: true, fullName: true, phoneNumber: true,
          role: true, status: true, withdrawalCode: true, createdAt: true, wallet: true,
        },
      }),
      prisma.transaction.groupBy({
        by: ["userId", "assetSymbol"],
        where: { type: "DEPOSIT", status: "APPROVED", assetSymbol: { not: null } },
        _sum: { assetAmount: true, amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["userId", "assetSymbol"],
        where: { type: "WITHDRAWAL", status: { in: ["PENDING", "APPROVED"] }, assetSymbol: { not: null } },
        _sum: { assetAmount: true, amount: true },
      }),
      prisma.assetBalance.findMany({ select: { userId: true, symbol: true, amount: true } }),
      getPrices(),
    ]);

    const key = (userId: string, symbol: string) => `${userId}:${symbol.toUpperCase()}`;
    const externalUnits = new Map<string, number>();
    const externalBookByUser = new Map<string, number>();
    const portfolioUnits = new Map<string, number>();
    const symbolsByUser = new Map<string, Set<string>>();
    const remember = (userId: string, symbol: string) => {
      const symbols = symbolsByUser.get(userId) || new Set<string>();
      symbols.add(symbol.toUpperCase());
      symbolsByUser.set(userId, symbols);
    };

    for (const deposit of deposits) {
      if (!deposit.assetSymbol) continue;
      const symbol = deposit.assetSymbol.toUpperCase();
      externalUnits.set(key(deposit.userId, symbol), Number(deposit._sum.assetAmount ?? 0));
      externalBookByUser.set(deposit.userId, (externalBookByUser.get(deposit.userId) ?? 0) + Number(deposit._sum.amount ?? 0));
      remember(deposit.userId, symbol);
    }
    for (const withdrawal of withdrawals) {
      if (!withdrawal.assetSymbol) continue;
      const symbol = withdrawal.assetSymbol.toUpperCase();
      const holdingKey = key(withdrawal.userId, symbol);
      externalUnits.set(holdingKey, (externalUnits.get(holdingKey) ?? 0) - Number(withdrawal._sum.assetAmount ?? 0));
      externalBookByUser.set(withdrawal.userId, (externalBookByUser.get(withdrawal.userId) ?? 0) - Number(withdrawal._sum.amount ?? 0));
      remember(withdrawal.userId, symbol);
    }
    for (const asset of assetBalances) {
      const symbol = asset.symbol.toUpperCase();
      portfolioUnits.set(key(asset.userId, symbol), Number(asset.amount));
      remember(asset.userId, symbol);
    }

    // Flatten wallet balances onto each user, as the admin page expects
    const users = rows.map(({ wallet, ...u }) => {
      const mainBalance = wallet?.mainBalance.toNumber() ?? 0;
      const holdingsValue = [...(symbolsByUser.get(u.id) ?? [])].reduce((sum, symbol) => {
        const units = Math.max(0, externalUnits.get(key(u.id, symbol)) ?? 0)
          + Math.max(0, portfolioUnits.get(key(u.id, symbol)) ?? 0);
        const price = priceSnapshot.prices[symbol];
        return sum + (price && price > 0 ? units * price : 0);
      }, 0);
      const externalBook = externalBookByUser.get(u.id) ?? 0;
      const portfolioBalance = Math.max(0, mainBalance + holdingsValue - externalBook);
      return {
        ...u,
        mainBalance,
        portfolioBalance: Math.round(portfolioBalance * 100) / 100,
        holdingsValue: Math.round(holdingsValue * 100) / 100,
        interestBalance: wallet?.interestBalance.toNumber() ?? 0,
        totalDeposited: wallet?.totalDeposited.toNumber() ?? 0,
        totalWithdrawn: wallet?.totalWithdrawn.toNumber() ?? 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        users,
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
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
