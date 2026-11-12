export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const plans = await db.plan.findMany();
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
