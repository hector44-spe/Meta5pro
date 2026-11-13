export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const addresses = await prisma.depositAddress.findMany({ orderBy: [{ symbol: "asc" }, { network: "asc" }] });
    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Fetch deposit addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposit addresses" },
      { status: 500 }
    );
  }
}
