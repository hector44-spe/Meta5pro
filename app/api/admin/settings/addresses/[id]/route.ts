export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { z } from "zod";

const addressSchema = z.object({
  address: z
    .string()
    .trim()
    .min(20, "That address looks too short")
    .max(120, "That address looks too long")
    .regex(/^[A-Za-z0-9:_-]+$/, "Addresses can only contain letters and numbers (no spaces)"),
  memo: z.string().trim().max(64, "Memo / tag is too long").optional().nullable(),
});

/** Saves ONE deposit address. Every change is recorded in the activity log. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const parsed = addressSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid address" }, { status: 400 });
    }

    const existing = await prisma.depositAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const address = parsed.data.address;
    const memo = parsed.data.memo ? parsed.data.memo : null;

    if (existing.address === address && (existing.memo ?? null) === memo) {
      return NextResponse.json({ success: true, unchanged: true, address: existing });
    }

    const [updated] = await prisma.$transaction([
      prisma.depositAddress.update({ where: { id }, data: { address, memo } }),
      prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "ADMIN_DEPOSIT_ADDRESS_UPDATED",
          ipAddress: clientIp(req),
          details: `${existing.symbol} (${existing.network}) address changed by ${session.email}: ${existing.address} -> ${address}${
            (existing.memo ?? null) !== memo ? ` | memo: ${existing.memo ?? "none"} -> ${memo ?? "none"}` : ""
          }`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, address: updated });
  } catch (error) {
    console.error("Update deposit address error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
