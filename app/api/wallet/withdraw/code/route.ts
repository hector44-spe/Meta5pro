export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Withdrawal confirmation codes via email have been removed. Contact admin for your withdrawal code." },
    { status: 400 },
  );
}
