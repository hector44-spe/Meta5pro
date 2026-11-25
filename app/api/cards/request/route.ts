export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { POST as handleCardsPost } from "../route";

/** Backwards-compatible route for card request deposits */
export async function POST(req: Request) {
  try {
    return await handleCardsPost(req);
  } catch (err: any) {
    console.error("Card request route error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process card request" },
      { status: 500 }
    );
  }
}
