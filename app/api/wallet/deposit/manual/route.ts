export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/appSettings";
import { notify, fmtUsd } from "@/lib/notify";
import { notifyAdminDeposit } from "@/lib/mail";
import { money } from "@/lib/ledger";

const RECEIPT_RE = /^\/api\/upload\/([0-9a-f-]{36})$/i;
const schema = z.object({
  method: z.enum(["BANK", "PAYPAL"]),
  amountUsd: z.number().positive().max(1_000_000_000),
  receiptUrl: z.string().regex(RECEIPT_RE),
  reference: z.string().trim().max(120).optional(),
}).strict();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid deposit" }, { status: 400 });

    const { method, receiptUrl, reference } = parsed.data;
    const settings = await getSettings("deposit");
    if (method === "BANK" && (!settings.allowBankTransfer || settings.banks.length === 0)) {
      return NextResponse.json({ error: "Bank transfer deposits are unavailable" }, { status: 409 });
    }
    if (method === "PAYPAL" && (!settings.allowPayPal || !settings.paypalEmail)) {
      return NextResponse.json({ error: "PayPal deposits are unavailable" }, { status: 409 });
    }
    const amount = money(parsed.data.amountUsd);
    if (amount < settings.minDeposit || amount > settings.maxDeposit) {
      return NextResponse.json({ error: `Deposits must be between ${fmtUsd(settings.minDeposit)} and ${fmtUsd(settings.maxDeposit)}.` }, { status: 400 });
    }

    const uploadId = RECEIPT_RE.exec(receiptUrl)?.[1];
    const upload = uploadId ? await prisma.proofUpload.findUnique({ where: { id: uploadId }, select: { userId: true } }) : null;
    if (!upload || upload.userId !== session.userId) return NextResponse.json({ error: "Invalid payment proof" }, { status: 400 });
    const reused = await prisma.transaction.findFirst({ where: { receiptUrl }, select: { id: true } });
    if (reused) return NextResponse.json({ error: "This payment proof has already been submitted" }, { status: 409 });

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        type: "DEPOSIT",
        amount,
        currency: method === "BANK" ? "BANK TRANSFER" : "PAYPAL",
        cryptoAddress: reference || null,
        txHash: `${method}_${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        receiptUrl,
        status: "PENDING",
      },
    });
    const shortReference = transaction.id.slice(0, 8).toUpperCase();
    await Promise.allSettled([
      notify(session.userId, "deposit", `${method === "BANK" ? "Bank transfer" : "PayPal"} deposit received`, `We received your ${fmtUsd(amount)} deposit. Reference ${shortReference}. It is pending review.`),
      notifyAdminDeposit({ userEmail: session.email, amount, currency: method === "BANK" ? "Bank transfer" : "PayPal", txHash: reference, hasReceipt: true, transactionId: transaction.id }),
    ]);

    return NextResponse.json({ success: true, reference: shortReference, transaction });
  } catch (error) {
    console.error("Manual deposit error:", error);
    return NextResponse.json({ error: "Deposit submission failed" }, { status: 500 });
  }
}
