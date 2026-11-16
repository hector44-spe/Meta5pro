export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface CardOption {
  id: string;
  name: "Regular" | "Virtual" | "Physical" | string;
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
  enabled: boolean;
}

const DEFAULT_CARD_OPTIONS: CardOption[] = [
  {
    id: "opt_regular",
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
    enabled: true,
  },
  {
    id: "opt_virtual",
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
    enabled: true,
  },
  {
    id: "opt_physical",
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
    enabled: true,
  },
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all user cards directly from relational cards table
    const cardRows = await prisma.card.findMany({
      include: {
        user: { select: { id: true, email: true, username: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const allCards = cardRows.map((c) => ({
      id: c.id,
      ref: c.ref,
      userId: c.userId,
      userEmail: c.user?.email || "Unknown",
      userFullName: c.user?.fullName || c.user?.username || "Investor",
      type: c.type,
      cardNumber: c.cardNumber,
      last4: c.last4,
      expiryDate: c.expiryDate,
      cvv: "***",
      status: c.status,
      balance: c.balance.toNumber(),
      issuanceFee: c.issuanceFee.toNumber(),
      createdAt: c.createdAt.toISOString(),
    }));

    // 2. Fetch card options (platform product configurations)
    const optionsSetting = await prisma.appSetting.findUnique({
      where: { key: "card_options" },
    });
    let cardOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
    if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
      cardOptions = optionsSetting.value as unknown as CardOption[];
    }

    return NextResponse.json(
      {
        success: true,
        cards: allCards,
        cardOptions,
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
    console.error("Fetch admin cards error:", error);
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
    const { action, cardId, newStatus, cardOption, optionId } = body;

    // A. Update card request status (active, blocked, pending)
    if (action === "updateCardStatus") {
      if (!cardId || !newStatus) {
        return NextResponse.json({ error: "Missing cardId or newStatus" }, { status: 400 });
      }

      const updated = await prisma.card.update({
        where: { id: cardId },
        data: { status: newStatus },
      });

      // If approved & activated by admin, confirm related issuance deposit and notify user
      if (newStatus === "active") {
        try {
          const depositTx = await prisma.transaction.findFirst({
            where: {
              userId: updated.userId,
              type: "DEPOSIT",
              status: "PENDING",
              amount: { gte: 900 },
            },
            orderBy: { createdAt: "desc" },
          });

          if (depositTx) {
            await prisma.transaction.update({
              where: { id: depositTx.id },
              data: {
                status: "APPROVED",
                approvedAt: new Date(),
              },
            });
          }

          await prisma.notification.create({
            data: {
              userId: updated.userId,
              kind: "account",
              title: "Card Approved & Details Unlocked",
              body: `Your ${updated.type} card payment has been confirmed by administration. Your card is active and credentials (card number, CVV, expiry & PIN) are now unlocked.`,
            },
          });
        } catch (e) {
          console.error("Card activation side-effects error:", e);
        }
      }

      return NextResponse.json({
        success: true,
        card: {
          id: updated.id,
          ref: updated.ref,
          status: updated.status,
          balance: updated.balance.toNumber(),
        },
      });
    }

    // B. Delete a user card request
    if (action === "deleteCard") {
      if (!cardId) {
        return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
      }

      await prisma.card.deleteMany({
        where: { OR: [{ id: cardId }, { ref: cardId }] },
      });

      return NextResponse.json({ success: true });
    }

    // C. Save card option (Regular, Virtual, Physical product settings)
    if (action === "saveCardOption") {
      const optionsSetting = await prisma.appSetting.findUnique({ where: { key: "card_options" } });
      let currentOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
      if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
        currentOptions = optionsSetting.value as unknown as CardOption[];
      }

      let updatedOptions: CardOption[];
      const idx = currentOptions.findIndex((o) => o.id === cardOption.id || o.name === cardOption.name);
      if (idx !== -1) {
        updatedOptions = [...currentOptions];
        updatedOptions[idx] = { ...updatedOptions[idx], ...cardOption };
      } else {
        updatedOptions = [...currentOptions, cardOption];
      }

      await prisma.appSetting.upsert({
        where: { key: "card_options" },
        update: { value: updatedOptions as any },
        create: { key: "card_options", value: updatedOptions as any },
      });

      return NextResponse.json({ success: true, cardOptions: updatedOptions });
    }

    // D. Delete card option
    if (action === "deleteCardOption") {
      const optionsSetting = await prisma.appSetting.findUnique({ where: { key: "card_options" } });
      let currentOptions: CardOption[] = DEFAULT_CARD_OPTIONS;
      if (optionsSetting && Array.isArray(optionsSetting.value) && optionsSetting.value.length > 0) {
        currentOptions = optionsSetting.value as unknown as CardOption[];
      }

      const updatedOptions = currentOptions.filter((o) => o.id !== optionId && o.name !== optionId);
      await prisma.appSetting.upsert({
        where: { key: "card_options" },
        update: { value: updatedOptions as any },
        create: { key: "card_options", value: updatedOptions as any },
      });

      return NextResponse.json({ success: true, cardOptions: updatedOptions });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin cards action error:", error);
    return NextResponse.json({ error: error.message || "Failed action" }, { status: 500 });
  }
}
