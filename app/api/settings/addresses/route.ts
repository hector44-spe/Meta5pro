export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const addresses = await db.depositAddress.findMany();
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
