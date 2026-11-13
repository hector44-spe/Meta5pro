export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/appSettings";

/** Public platform flags the investor UI needs (no admin-only data). */
export async function GET() {
  const general = await getSettings("general");
  return NextResponse.json({
    success: true,
    verificationRequired: general.lockVerification,
    cards: { regular: general.allowRegularCard, virtual: general.allowVirtualCard },
  });
}
