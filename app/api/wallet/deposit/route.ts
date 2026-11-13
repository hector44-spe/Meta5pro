export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { money } from "@/lib/ledger";
import { notifyAdminDeposit } from "@/lib/mail";
import { z } from "zod";

// Receipts must be proofs this user uploaded through /api/upload.
const RECEIPT_RE = /^\/api\/upload\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/**
 * Normalizes an on-chain transaction hash, or returns null if it isn't one.
 * - BTC, TRON, XRP and EVM chains (ETH/BSC): 64 hex chars, EVM with a 0x prefix
 * - Solana: base58 signature, 80–90 chars
 */
function normalizeTxHash(raw: string): string | null {
  const h = raw.trim();
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(h)) return h.toLowerCase().replace(/^0x/, "");
  if (/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(h)) return h; // base58 is case-sensitive
  return null;
}

const depositSchema = z.object({
  amount: z.number().positive("Deposit amount must be greater than 0").max(10_000_000, "Amount is too large"),
  currency: z.string().trim().min(1, "Currency is required").max(20),
  network: z.string().trim().max(30).optional(),
  txHash: z.string().trim().max(120).optional(),
  cryptoAddress: z.string().trim().max(120).optional(),
  receiptUrl: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = depositSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { amount, currency, network, cryptoAddress } = parsed.data;
    const txHashInput = parsed.data.txHash || undefined;
    const receiptUrl = parsed.data.receiptUrl || undefined;

    // Must have either receipt screenshot or txHash
    if (!receiptUrl && !txHashInput) {
      return NextResponse.json(
        { error: "Please upload a payment screenshot proof or provide a transaction hash." },
        { status: 400 },
      );
    }

    // 1. Receipt: must be an upload owned by this user, and not already used for another deposit.
    if (receiptUrl) {
      const match = RECEIPT_RE.exec(receiptUrl);
      const upload = match
        ? await prisma.proofUpload.findUnique({ where: { id: match[1] }, select: { userId: true } })
        : null;
      if (!upload || upload.userId !== session.userId) {
        return NextResponse.json({ error: "Invalid payment proof. Please upload the screenshot again." }, { status: 400 });
      }
      const reused = await prisma.transaction.findFirst({ where: { receiptUrl }, select: { id: true } });
      if (reused) {
        return NextResponse.json({ error: "This payment proof has already been submitted." }, { status: 409 });
      }
    }

    // 2. Transaction hash: must look like a real on-chain hash.
    let depositHash: string | null = null;
    if (txHashInput) {
      depositHash = normalizeTxHash(txHashInput);
      if (!depositHash) {
        return NextResponse.json(
          { error: "That doesn't look like a valid transaction hash. Copy the TxID from your wallet or block explorer." },
          { status: 400 },
        );
      }
    }

    const fullCurrency = network ? `${currency} (${network})` : currency;

    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId: session.userId,
          type: "DEPOSIT",
          amount: money(amount),
          currency: fullCurrency,
          cryptoAddress: cryptoAddress || null,
          txHash: txHashInput ?? `PROOF_${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          depositHash,
          receiptUrl: receiptUrl ?? null,
          status: "PENDING",
        },
      });

      await notifyAdminDeposit({
        userEmail: session.email,
        amount: transaction.amount.toNumber(),
        currency: fullCurrency,
        txHash: txHashInput ?? null,
        hasReceipt: Boolean(receiptUrl),
        transactionId: transaction.id,
      });

      return NextResponse.json({
        success: true,
        message: "Deposit submitted successfully. Awaiting administrative review.",
        transaction,
      });
    } catch (e) {
      // 3. Same hash already claimed (enforced by a unique index, so it holds under concurrency too)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json(
          { error: "This transaction hash has already been submitted." },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Deposit submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
