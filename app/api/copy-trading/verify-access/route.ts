export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/appSettings";

const UNLOCK_COOKIE = "mg5_copy_access_unlocked";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const settings = await getSettings("copyExperts");
    const requireAccessCode = Boolean(settings?.requireAccessCode);

    if (!requireAccessCode) {
      return NextResponse.json({ unlocked: true, requireAccessCode: false });
    }

    if (session?.role === "ADMIN") {
      return NextResponse.json({ unlocked: true, requireAccessCode: true, isAdmin: true });
    }

    const cookieStore = await cookies();
    const isUnlocked = cookieStore.get(UNLOCK_COOKIE)?.value === "1";

    return NextResponse.json({
      unlocked: isUnlocked,
      requireAccessCode: true,
      isAdmin: false,
    });
  } catch (error) {
    console.error("Error checking copy trading access:", error);
    return NextResponse.json({ unlocked: false, requireAccessCode: true }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const enteredCode = String(body.code || "").trim();

    if (!enteredCode) {
      return NextResponse.json(
        { error: "Please enter an access code." },
        { status: 400 }
      );
    }

    const settings = await getSettings("copyExperts");
    const expectedCode = String(settings?.accessCode || "639852").trim();

    if (enteredCode !== expectedCode) {
      return NextResponse.json(
        { error: "Invalid access code. Please contact live support to receive your access code." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(UNLOCK_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, unlocked: true });
  } catch (error) {
    console.error("Error verifying copy trading access code:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}
