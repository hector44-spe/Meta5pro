export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface FullAddressItem {
  id: string;
  token: string;
  symbol: string;
  network: string;
  address: string;
  memo: string | null;
  qrCode?: string | null;
  isSignal?: boolean;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Regular deposit addresses from Postgres
    const regularAddresses = await prisma.depositAddress.findMany({
      orderBy: [{ symbol: "asc" }, { network: "asc" }],
    });

    // 2. Fetch QR codes and signal addresses settings from AppSetting
    const [qrSetting, signalSetting, toggleSetting] = await Promise.all([
      prisma.appSetting.findUnique({ where: { key: "deposit_address_qrs" } }),
      prisma.appSetting.findUnique({ where: { key: "signal_deposit_addresses" } }),
      prisma.appSetting.findUnique({ where: { key: "use_same_address_for_signals" } }),
    ]);

    const qrMap: Record<string, string> =
      qrSetting && typeof qrSetting.value === "object" && qrSetting.value !== null
        ? (qrSetting.value as Record<string, string>)
        : {};

    const addresses: FullAddressItem[] = regularAddresses.map((a) => ({
      id: a.id,
      token: a.token,
      symbol: a.symbol,
      network: a.network,
      address: a.address,
      memo: a.memo,
      qrCode: qrMap[a.id] || null,
      isSignal: false,
    }));

    let signalAddresses: FullAddressItem[] = [];
    if (signalSetting && Array.isArray(signalSetting.value)) {
      signalAddresses = signalSetting.value as unknown as FullAddressItem[];
    } else {
      // Default signal addresses if none configured
      signalAddresses = [
        {
          id: "sig_btc",
          token: "Bitcoin",
          symbol: "BTC",
          network: "Default",
          address: "bc1q49kst4pg9ddq6c8ady",
          memo: null,
          isSignal: true,
        },
        {
          id: "sig_eth",
          token: "Ethereum",
          symbol: "ETH",
          network: "ERC-20",
          address: "0xCdBCA855e655fb66fE7Cl",
          memo: null,
          isSignal: true,
        },
        {
          id: "sig_sol",
          token: "Solana",
          symbol: "SOL",
          network: "Default",
          address: "2LQ1RC9ey6y2vnVoc7Aoxj",
          memo: null,
          isSignal: true,
        },
      ];
    }

    const useSameAddress = toggleSetting ? Boolean((toggleSetting.value as any)?.enabled) : false;

    return NextResponse.json(
      {
        success: true,
        addresses,
        signalAddresses,
        useSameAddressForSignals: useSameAddress,
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
    console.error("Fetch admin addresses error:", error);
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
    const { action, addressData, addressId, isSignal, useSameAddress } = body;

    // Toggle "Use same address as regular deposit"
    if (action === "toggleSameAddress") {
      await prisma.appSetting.upsert({
        where: { key: "use_same_address_for_signals" },
        update: { value: { enabled: !!useSameAddress } },
        create: { key: "use_same_address_for_signals", value: { enabled: !!useSameAddress } },
      });
      return NextResponse.json({ success: true, useSameAddressForSignals: !!useSameAddress });
    }

    // Save or Add Address
    if (action === "saveAddress") {
      const { id, token, symbol, network, address, memo, qrCode } = addressData;
      if (!symbol || !address) {
        return NextResponse.json({ error: "Symbol and Address are required" }, { status: 400 });
      }

      if (isSignal) {
        // Manage signal deposit addresses
        const setting = await prisma.appSetting.findUnique({ where: { key: "signal_deposit_addresses" } });
        let list: FullAddressItem[] = [];
        if (setting && Array.isArray(setting.value)) {
          list = setting.value as unknown as FullAddressItem[];
        }

        const targetId = id || `sig_${Date.now()}`;
        const newSigItem: FullAddressItem = {
          id: targetId,
          token: token || symbol,
          symbol: symbol.toUpperCase(),
          network: network || "Default",
          address: address.trim(),
          memo: memo ? memo.trim() : null,
          qrCode: qrCode || null,
          isSignal: true,
        };

        const idx = list.findIndex((a) => a.id === targetId || (a.symbol === newSigItem.symbol && a.network === newSigItem.network));
        if (idx !== -1) {
          list[idx] = newSigItem;
        } else {
          list.push(newSigItem);
        }

        await prisma.appSetting.upsert({
          where: { key: "signal_deposit_addresses" },
          update: { value: list as any },
          create: { key: "signal_deposit_addresses", value: list as any },
        });

        return NextResponse.json({ success: true, item: newSigItem });
      } else {
        // Manage regular deposit addresses in Postgres
        let savedAddr;
        if (id && !id.startsWith("new_")) {
          savedAddr = await prisma.depositAddress.update({
            where: { id },
            data: {
              token: token || symbol,
              symbol: symbol.toUpperCase(),
              network: network || "Default",
              address: address.trim(),
              memo: memo ? memo.trim() : null,
            },
          });
        } else {
          // Check if symbol & network unique combo already exists
          const existing = await prisma.depositAddress.findUnique({
            where: { symbol_network: { symbol: symbol.toUpperCase(), network: network || "Default" } },
          });
          if (existing) {
            savedAddr = await prisma.depositAddress.update({
              where: { id: existing.id },
              data: {
                token: token || symbol,
                address: address.trim(),
                memo: memo ? memo.trim() : null,
              },
            });
          } else {
            savedAddr = await prisma.depositAddress.create({
              data: {
                token: token || symbol,
                symbol: symbol.toUpperCase(),
                network: network || "Default",
                address: address.trim(),
                memo: memo ? memo.trim() : null,
              },
            });
          }
        }

        // Save QR code if provided
        if (qrCode !== undefined) {
          const qrSetting = await prisma.appSetting.findUnique({ where: { key: "deposit_address_qrs" } });
          const qrMap: Record<string, string> =
            qrSetting && typeof qrSetting.value === "object" && qrSetting.value !== null
              ? (qrSetting.value as Record<string, string>)
              : {};
          if (qrCode) {
            qrMap[savedAddr.id] = qrCode;
          } else {
            delete qrMap[savedAddr.id];
          }
          await prisma.appSetting.upsert({
            where: { key: "deposit_address_qrs" },
            update: { value: qrMap },
            create: { key: "deposit_address_qrs", value: qrMap },
          });
        }

        return NextResponse.json({ success: true, item: { ...savedAddr, qrCode } });
      }
    }

    // Delete Address
    if (action === "deleteAddress") {
      if (!addressId) {
        return NextResponse.json({ error: "Missing addressId" }, { status: 400 });
      }

      if (isSignal) {
        const setting = await prisma.appSetting.findUnique({ where: { key: "signal_deposit_addresses" } });
        if (setting && Array.isArray(setting.value)) {
          const filtered = (setting.value as any[]).filter((a) => a.id !== addressId);
          await prisma.appSetting.update({
            where: { key: "signal_deposit_addresses" },
            data: { value: filtered },
          });
        }
      } else {
        await prisma.depositAddress.delete({ where: { id: addressId } }).catch(() => null);
        // Clean up QR code
        const qrSetting = await prisma.appSetting.findUnique({ where: { key: "deposit_address_qrs" } });
        if (qrSetting && typeof qrSetting.value === "object" && qrSetting.value !== null) {
          const qrMap = { ...(qrSetting.value as Record<string, string>) };
          delete qrMap[addressId];
          await prisma.appSetting.update({
            where: { key: "deposit_address_qrs" },
            data: { value: qrMap },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin address action error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
