import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { atomic } from "@/lib/ledger";
import { notify, fmtUsd } from "@/lib/notify";

export const dynamic = "force-dynamic";

const RECEIPT_RE = /^\/api\/upload\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function normalizeTxHash(raw: string): string | null {
  const value = raw.trim();
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(value)) return value.toLowerCase().replace(/^0x/, "");
  if (/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(value)) return value;
  return null;
}

const purchaseSchema = z.object({
  signalId: z.string().trim().min(1).max(100),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/),
  network: z.string().trim().max(30).optional(),
  txHash: z.string().trim().max(120).optional(),
  receiptUrl: z.string().trim().max(200).optional(),
  cryptoAddress: z.string().trim().max(160).optional(),
}).strict();

function historyItem(row: {
  id: string; ref: string; signalTitle: string; price: Prisma.Decimal;
  strength: number; status: string; createdAt: Date;
}) {
  return {
    id: row.id, ref: row.ref, signal: row.signalTitle, signalTitle: row.signalTitle,
    price: row.price.toNumber(), strength: row.strength, status: row.status,
    date: row.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await prisma.signalPurchase.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
    const signalBalance = rows.filter((row) => row.status === "active" || row.status === "approved").reduce((sum, row) => sum + row.price.toNumber(), 0);
    return NextResponse.json({ success: true, history: rows.map(historyItem), signalBalance });
  } catch (error) {
    console.error("Fetch signal history error:", error);
    return NextResponse.json({ error: "Failed to load signal history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = purchaseSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid signal purchase" }, { status: 400 });
    const { signalId, currency, receiptUrl, cryptoAddress } = parsed.data;
    const signal = await prisma.tradingSignalConfig.findFirst({ where: { id: signalId, active: true } });
    if (!signal) return NextResponse.json({ error: "Signal package is unavailable" }, { status: 404 });
    if (!parsed.data.txHash && !receiptUrl) return NextResponse.json({ error: "Upload a payment proof or provide a transaction hash" }, { status: 400 });

    let depositHash: string | null = null;
    if (parsed.data.txHash) {
      depositHash = normalizeTxHash(parsed.data.txHash);
      if (!depositHash) return NextResponse.json({ error: "Enter a valid blockchain transaction hash" }, { status: 400 });
    }
    if (receiptUrl) {
      const match = RECEIPT_RE.exec(receiptUrl);
      const upload = match ? await prisma.proofUpload.findUnique({ where: { id: match[1] }, select: { userId: true } }) : null;
      if (!upload || upload.userId !== session.userId) return NextResponse.json({ error: "Invalid payment proof" }, { status: 400 });
      if (await prisma.transaction.findFirst({ where: { receiptUrl }, select: { id: true } })) {
        return NextResponse.json({ error: "This payment proof has already been submitted" }, { status: 409 });
      }
    }

    const reference = `SIG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const purchase = await atomic(async (tx) => {
      const payment = await tx.transaction.create({
        data: {
          userId: session.userId, type: "SIGNAL_PURCHASE_PAYMENT", status: "PENDING",
          amount: signal.price, currency,
          txHash: parsed.data.txHash?.trim() || `SIGNAL_PROOF_${crypto.randomUUID()}`,
          depositHash, receiptUrl: receiptUrl || null, cryptoAddress: cryptoAddress || null,
          assetSymbol: currency,
        },
      });
      return tx.signalPurchase.create({
        data: {
          userId: session.userId, ref: reference, signalId: signal.id,
          signalTitle: signal.title, price: signal.price, strength: signal.strength,
          status: "pending", paymentTransactionId: payment.id,
        },
      });
    });

    await notify(session.userId, "deposit", "Signal payment submitted", `Payment of ${fmtUsd(signal.price.toNumber())} was submitted for ${signal.title}. It will activate after verification.`);
    const rows = await prisma.signalPurchase.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
    const signalBalance = rows.filter((row) => row.status === "active" || row.status === "approved").reduce((sum, row) => sum + row.price.toNumber(), 0);
    return NextResponse.json({ success: true, message: `Payment submitted for ${signal.title}.`, signal: historyItem(purchase), history: rows.map(historyItem), signalBalance });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This transaction hash has already been submitted" }, { status: 409 });
    }
    console.error("Purchase signal error:", error);
    return NextResponse.json({ error: "Failed to submit signal payment" }, { status: 500 });
  }
}
