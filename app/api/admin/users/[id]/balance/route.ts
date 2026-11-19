export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { atomic, audit, creditMain, debitMain, insertTransaction, InsufficientFundsError } from "@/lib/ledger";
import { notify, fmtUsd, fmtUnits } from "@/lib/notify";
import { getVerifiedPrice } from "@/lib/prices";
import assetsData from "@/data/assetsData.json";
import { z } from "zod";

const SUPPORTED_ASSETS = new Set(
  (assetsData as Array<{ symbol: string }>).map((asset) => asset.symbol.toUpperCase()),
);

const balanceSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  action: z.enum(["credit", "debit"]),
  assetSymbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,12}$/).default("USD"),
  note: z.string().max(500).optional(),
}).strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const parsed = balanceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { amount, action, assetSymbol, note } = parsed.data;

    const exists = await prisma.wallet.findUnique({ where: { userId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ip = clientIp(req);

    if (assetSymbol !== "USD") {
      if (action !== "credit") {
        return NextResponse.json({ error: "Asset adjustments currently support adding funds only. Use USD to remove funds." }, { status: 400 });
      }
      if (!SUPPORTED_ASSETS.has(assetSymbol)) {
        return NextResponse.json({ error: "Unsupported asset" }, { status: 400 });
      }

      const price = await getVerifiedPrice(assetSymbol);
      if (!price || price <= 0) {
        return NextResponse.json({ error: `A verified live price for ${assetSymbol} is unavailable. Try again shortly.` }, { status: 503 });
      }
      const assetAmount = Number((amount / price).toFixed(10));
      if (!(assetAmount > 0)) {
        return NextResponse.json({ error: "The amount is too small for this asset" }, { status: 400 });
      }

      const result = await atomic(async (tx) => {
        const balance = await tx.assetBalance.upsert({
          where: { userId_symbol: { userId, symbol: assetSymbol } },
          create: { userId, symbol: assetSymbol, amount: assetAmount },
          update: { amount: { increment: assetAmount } },
        });
        const transaction = await insertTransaction(tx, {
          userId,
          type: "TRADE_CONVERT",
          amount,
          currency: "USD",
          assetSymbol,
          assetAmount,
          status: "APPROVED",
        });
        await audit(
          tx,
          session.userId,
          "ADMIN_ASSET_CREDIT",
          ip,
          `Admin ${session.userId} (${session.email}) credited ${fmtUnits(assetAmount, assetSymbol)} at ${fmtUsd(price)} per unit (${fmtUsd(amount)} acquisition value). Note: ${note || "Manual asset credit"}`,
          userId,
        );
        return { balance, transaction };
      });

      await notify(
        userId,
        "balance",
        `${assetSymbol} credited`,
        `${fmtUnits(assetAmount, assetSymbol)} (${fmtUsd(amount)} at the credit-time market price) was added to your portfolio by support.${note ? ` Note: ${note}` : ""}`,
      );

      return NextResponse.json({
        success: true,
        message: `${fmtUnits(assetAmount, assetSymbol)} added to the user's portfolio.`,
        asset: {
          symbol: assetSymbol,
          units: assetAmount,
          price,
          usdValue: amount,
          totalUnits: Number(result.balance.amount),
        },
        transaction: result.transaction,
      });
    }

    try {
      const newBalance = await atomic(async (tx) => {
        const balance = action === "credit"
          ? await creditMain(tx, userId, amount)
          : await debitMain(tx, userId, amount);
        await audit(
          tx,
          session.userId,
          `ADMIN_BALANCE_${action.toUpperCase()}`,
          ip,
          `Admin ${session.userId} (${session.email}) ${action}ed $${amount}. Note: ${note || "Manual balance correction"}`,
          userId,
        );
        return balance;
      });

      await notify(
        userId,
        "balance",
        action === "credit" ? "Balance credited" : "Balance debited",
        `${fmtUsd(amount)} was ${action === "credit" ? "added to" : "deducted from"} your balance by support. New balance: ${fmtUsd(newBalance)}.${note ? ` Note: ${note}` : ""}`,
      );

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      return NextResponse.json({
        success: true,
        message: `User balance ${action}ed by $${amount}. New balance: $${newBalance.toFixed(2)}`,
        wallet,
      });
    } catch (e) {
      if (e instanceof InsufficientFundsError) {
        return NextResponse.json(
          { error: `Insufficient user balance to debit $${amount}. Current balance: $${e.available.toFixed(2)}` },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Admin balance adjustment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
