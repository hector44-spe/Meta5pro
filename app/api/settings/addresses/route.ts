export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rawAddresses, qrSetting, signalSetting, toggleSetting] = await Promise.all([
      prisma.depositAddress.findMany({ orderBy: [{ symbol: "asc" }, { network: "asc" }] }),
      prisma.appSetting.findUnique({ where: { key: "deposit_address_qrs" } }),
      prisma.appSetting.findUnique({ where: { key: "signal_deposit_addresses" } }),
      prisma.appSetting.findUnique({ where: { key: "use_same_address_for_signals" } }),
    ]);

    const qrMap: Record<string, string> =
      qrSetting && typeof qrSetting.value === "object" && qrSetting.value !== null
        ? (qrSetting.value as Record<string, string>)
        : {};

    const addresses = rawAddresses.map((a) => ({
      id: a.id,
      token: a.token,
      symbol: a.symbol,
      network: a.network,
      address: a.address,
      memo: a.memo,
      qrCode: qrMap[a.id] || null,
    }));

    let signalAddresses: any[] = [];
    if (signalSetting && Array.isArray(signalSetting.value)) {
      signalAddresses = signalSetting.value;
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
        },
      }
    );
  } catch (error) {
    console.error("Fetch deposit addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposit addresses" },
      { status: 500 }
    );
  }
}
