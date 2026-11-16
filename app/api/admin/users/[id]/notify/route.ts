export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const notifySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  body: z.string().min(1, "Message is required").max(1000),
  kind: z.enum(["custom", "admin", "alert", "deposit", "withdrawal", "trade", "investment", "security", "account"]).default("custom"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const json = await req.json();
    const parsed = notifySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { title, body, kind } = parsed.data;
    await notify(userId, kind, title, body);

    return NextResponse.json({
      success: true,
      message: `Notification successfully sent to ${user.email}`,
    });
  } catch (error) {
    console.error("Admin send notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
