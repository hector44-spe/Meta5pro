export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { issueWithdrawalCode, recentCodeCount } from "@/lib/withdrawalCode";
import { mailConfigured, sendWithdrawalCodeEmail } from "@/lib/mail";

const WALLET_MAINTENANCE_PAUSED = true;

/** Emails the signed-in user a one-time code that confirms their next withdrawal. */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.status === "FROZEN") {
      return NextResponse.json(
        { error: "Your account is frozen. Withdrawals are disabled." },
        { status: 403 },
      );
    }

    // Temporary wallet maintenance: halt withdrawal code dispatch and direct user to live support
    if (WALLET_MAINTENANCE_PAUSED) {
      return NextResponse.json(
        { error: "Sending failed, contact support for more info" },
        { status: 400 },
      );
    }

    if ((await recentCodeCount(session.userId)) >= 5) {
      return NextResponse.json(
        { error: "Too many codes requested. Please wait an hour and try again." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : null;

    const code = await issueWithdrawalCode(session.userId);
    const sent = await sendWithdrawalCodeEmail(session.email, code, amount);

    if (!sent && mailConfigured()) {
      return NextResponse.json({ error: "We couldn't send the email. Please try again." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `We sent a 6-digit code to ${session.email}. It expires in 10 minutes.`,
    });
  } catch (error) {
    console.error("Withdrawal code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
