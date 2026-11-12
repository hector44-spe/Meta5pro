export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Check target user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Do not allow suspending the super admin
    if (user.role === "ADMIN" && status === "SUSPENDED") {
      return NextResponse.json({ error: "Cannot suspend a Super Admin account" }, { status: 400 });
    }

    sqlite.prepare("UPDATE users SET status = ?, updatedAt = ? WHERE id = ?").run(
      status,
      new Date().toISOString(),
      userId
    );

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      status,
    });
  } catch (error) {
    console.error("Admin user status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
