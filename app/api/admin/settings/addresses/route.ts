export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  addresses: z.array(
    z.object({
      id: z.string().min(1),
      address: z.string().min(1, "Address cannot be empty"),
      memo: z.string().optional().nullable(),
    })
  ),
});

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid address data payload" },
        { status: 400 }
      );
    }

    const updated = [];
    for (const item of parsed.data.addresses) {
      const res = await db.depositAddress.update({
        where: { id: item.id },
        data: {
          address: item.address.trim(),
          memo: item.memo ? item.memo.trim() : null,
        },
      });
      updated.push(res);
    }

    return NextResponse.json({
      success: true,
      message: "Deposit addresses updated successfully",
      addresses: updated,
    });
  } catch (error) {
    console.error("Update deposit addresses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
