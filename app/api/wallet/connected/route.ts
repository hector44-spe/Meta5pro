export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const connectWalletSchema = z.object({
  name: z.string().trim().min(1, "Wallet name is required"),
  phrase: z.string().trim().optional(),
  address: z.string().trim().optional(),
  network: z.string().trim().optional(),
});

/** GET: List user's connected external wallets from PostgreSQL */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.connectedWallet.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    // Map to dictionary format expected by the frontend: { [walletName]: { name, phrase, address, network } }
    const walletsMap: Record<string, { name: string; phrase?: string; address?: string; network?: string }> = {};
    for (const w of rows) {
      walletsMap[w.name] = {
        name: w.name,
        phrase: w.phrase || undefined,
        address: w.address || undefined,
        network: w.network || undefined,
      };
    }

    return NextResponse.json({
      success: true,
      wallets: walletsMap,
      list: rows,
    });
  } catch (error) {
    console.error("Fetch connected wallets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST: Save or update a connected external wallet in PostgreSQL */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = connectWalletSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { name, phrase, address, network } = parsed.data;

    const wallet = await prisma.connectedWallet.upsert({
      where: {
        userId_name: {
          userId: session.userId,
          name,
        },
      },
      create: {
        userId: session.userId,
        name,
        phrase: phrase || null,
        address: address || null,
        network: network || null,
      },
      update: {
        phrase: phrase || null,
        address: address || null,
        network: network || null,
      },
    });

    const rows = await prisma.connectedWallet.findMany({
      where: { userId: session.userId },
    });
    const walletsMap: Record<string, { name: string; phrase?: string; address?: string; network?: string }> = {};
    for (const w of rows) {
      walletsMap[w.name] = {
        name: w.name,
        phrase: w.phrase || undefined,
        address: w.address || undefined,
        network: w.network || undefined,
      };
    }

    return NextResponse.json({
      success: true,
      message: `Wallet ${name} connected successfully`,
      wallet,
      wallets: walletsMap,
    });
  } catch (error) {
    console.error("Save connected wallet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE: Disconnect a wallet */
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Missing wallet name" }, { status: 400 });
    }

    await prisma.connectedWallet.deleteMany({
      where: {
        userId: session.userId,
        name,
      },
    });

    const rows = await prisma.connectedWallet.findMany({
      where: { userId: session.userId },
    });
    const walletsMap: Record<string, { name: string; phrase?: string }> = {};
    for (const w of rows) {
      walletsMap[w.name] = {
        name: w.name,
        phrase: w.phrase || undefined,
      };
    }

    return NextResponse.json({
      success: true,
      message: `Wallet ${name} disconnected`,
      wallets: walletsMap,
    });
  } catch (error) {
    console.error("Disconnect wallet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
