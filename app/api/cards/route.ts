import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { atomic, debitMain, insertTransaction, InsufficientFundsError } from "@/lib/ledger";
import { getSettings } from "@/lib/appSettings";
import { cardPinSchema, cardRequestSchema, cardStatusSchema, cardTopupSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export interface UserCard {
  id: string;
  ref: string;
  userId: string;
  type: "Regular" | "Virtual" | "Physical";
  cardNumber: string;
  last4: string;
  expiryDate: string;
  cvv: string;
  cardPin?: string;
  status: "active" | "pending" | "blocked";
  balance: number;
  issuanceFee: number;
  createdAt: string;
  transactions?: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
  trackingDetails?: Array<{
    id: string;
    status: string;
    date: string;
    time: string;
  }>;
}

function generateCardNumber(prefix = "4242"): string {
  let rest = "";
  for (let i = 0; i < 12; i++) {
    rest += Math.floor(Math.random() * 10).toString();
  }
  return prefix + rest;
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry(): string {
  const futureYear = new Date().getFullYear() + 4;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  return `${month}/${String(futureYear).slice(-2)}`;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.card.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const cards: UserCard[] = rows.map((c) => ({
      id: c.id,
      ref: c.ref,
      userId: c.userId,
      type: c.type as "Regular" | "Virtual" | "Physical",
      cardNumber: c.status === "active" ? c.cardNumber : "•••• •••• •••• ••••",
      last4: c.last4,
      expiryDate: c.status === "active" ? c.expiryDate : "**/**",
      cvv: "***",
      status: c.status as "active" | "pending" | "blocked",
      balance: c.balance.toNumber(),
      issuanceFee: c.issuanceFee.toNumber(),
      createdAt: c.createdAt.toISOString(),
      trackingDetails:
        c.type === "Physical"
          ? [
              {
                id: "t1",
                status: "Card requested and approved",
                date: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "10:00 AM",
              },
              {
                id: "t2",
                status: "Production & packaging",
                date: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "02:30 PM",
              },
              {
                id: "t3",
                status: "Dispatched with express courier",
                date: new Date(c.createdAt.getTime() + 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                time: "09:15 AM",
              },
            ]
          : undefined,
    }));

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error("Fetch cards error:", error);
    return NextResponse.json({
      success: true,
      cards: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || "request";

    if (action === "request" || !action) {
      const parsed = cardRequestSchema.safeParse({ ...body, action: "request" });
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid card request" }, { status: 400 });
      }
      const { cardType: type, cardPin, currency, txHash, receiptUrl, cryptoAddress } = parsed.data;
      if (!txHash && !receiptUrl) {
        return NextResponse.json({ error: "A transaction hash or uploaded payment proof is required" }, { status: 400 });
      }

      // Check if user already has this card type
      const existing = await prisma.card.findFirst({
        where: { userId: session.userId, type: { equals: type, mode: "insensitive" } },
      });
      if (existing) {
        return NextResponse.json(
          { error: `You already have a ${type} card.` },
          { status: 400 },
        );
      }

      const rawNumber = generateCardNumber();
      const last4 = rawNumber.slice(-4);
      const masked = `${rawNumber.slice(0, 4)} **** **** ${last4}`;
      const ref = `CRD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const pinHash = await hashPassword(cardPin);
      const cardSettings = await getSettings("cards");
      const issuanceFee = cardSettings.issuanceFee;

      // The card and its exact payment record are created together and linked by an immutable reference.
      const card = await atomic(async (tx) => {
        const created = await tx.card.create({
          data: {
            userId: session.userId,
            ref,
            type,
            cardNumber: masked,
            last4,
            expiryDate: generateExpiry(),
            pinHash,
            status: "pending",
            balance: 0,
            issuanceFee,
          },
        });
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: "CARD_ISSUANCE_PAYMENT",
            status: "PENDING",
            amount: issuanceFee,
            currency: currency || "USDT",
            txHash: `CARD_PAYMENT_${created.id}`,
            depositHash: txHash || null,
            receiptUrl: receiptUrl || null,
            cryptoAddress: cryptoAddress || null,
          },
        });
        return created;
      });

      const newCard: UserCard = {
        id: card.id,
        ref: card.ref,
        userId: card.userId,
        type: card.type as "Regular" | "Virtual" | "Physical",
        cardNumber: card.cardNumber,
        last4: card.last4,
        expiryDate: card.expiryDate,
        cvv: generateCVV(),
        status: card.status as "active" | "pending" | "blocked",
        balance: card.balance.toNumber(),
        issuanceFee: card.issuanceFee.toNumber(),
        createdAt: card.createdAt.toISOString(),
      };

      const userCards = await prisma.card.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        message: "Card request and separate issuance deposit submitted! Your card will activate upon verification.",
        cards: userCards.map((c) => ({
          ...c,
          balance: c.balance.toNumber(),
          issuanceFee: c.issuanceFee.toNumber(),
          cvv: "***",
        })),
        newCard,
      });
    }

    if (action === "topup") {
      const parsed = cardTopupSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid top-up" }, { status: 400 });
      const { cardId, amount } = parsed.data;
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      if (target.status !== "active") {
        return NextResponse.json({ error: "Only an active card can be topped up" }, { status: 400 });
      }
      try {
        await atomic(async (tx) => {
          await debitMain(tx, session.userId, amount, {
            referenceType: "CARD_TOPUP",
            referenceId: target.id,
            counterAccount: `CARD:${target.id}`,
          });
          await tx.card.update({ where: { id: target.id }, data: { balance: { increment: amount } } });
          await insertTransaction(tx, {
            userId: session.userId,
            type: "CARD_TOPUP",
            amount,
            currency: "USD",
            status: "APPROVED",
            txHash: `CARD_TOPUP_${crypto.randomUUID()}`,
          });
        });
      } catch (error) {
        if (error instanceof InsufficientFundsError) {
          return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }
        throw error;
      }

      const userCards = await prisma.card.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        cards: userCards.map((c) => ({ ...c, balance: c.balance.toNumber(), issuanceFee: c.issuanceFee.toNumber() })),
      });
    }

    if (action === "changePin") {
      const parsed = cardPinSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid PIN" }, { status: 400 });
      const { cardId, newPin } = parsed.data;
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      const pinHash = await hashPassword(newPin);
      await prisma.card.update({
        where: { id: target.id },
        data: { pinHash },
      });

      return NextResponse.json({ success: true, message: "PIN changed successfully" });
    }

    if (action === "toggleStatus") {
      const parsed = cardStatusSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid card status request" }, { status: 400 });
      const { cardId } = parsed.data;
      const target = await prisma.card.findFirst({
        where: {
          userId: session.userId,
          OR: [{ id: cardId }, { ref: cardId }],
        },
      });
      if (!target) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      if (target.status === "pending") {
        return NextResponse.json({ error: "Pending cards can only be activated by an administrator" }, { status: 403 });
      }
      const nextStatus = target.status === "blocked" ? "active" : "blocked";
      const updated = await prisma.card.update({
        where: { id: target.id },
        data: { status: nextStatus },
      });

      return NextResponse.json({ success: true, message: `Card ${updated.status} successfully` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Cards POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
