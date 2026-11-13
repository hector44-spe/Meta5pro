export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { minDeposit: "asc" } });
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment plans" },
      { status: 500 }
    );
  }
}
