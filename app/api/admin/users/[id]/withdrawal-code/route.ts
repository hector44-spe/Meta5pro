export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { audit } from "@/lib/ledger";
import { DEFAULT_WITHDRAWAL_CODE } from "@/lib/withdrawalCode";
import { z } from "zod";

const schema = z.object({
  withdrawalCode: z.string().trim().max(30).nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, withdrawalCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      withdrawalCode: user.withdrawalCode,
      defaultCode: DEFAULT_WITHDRAWAL_CODE,
      effectiveCode: user.withdrawalCode?.trim() || DEFAULT_WITHDRAWAL_CODE,
    });
  } catch (error) {
    console.error("Get withdrawal code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const raw = parsed.data.withdrawalCode;
    const nextCode = raw && raw.trim() !== "" ? raw.trim() : null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { withdrawalCode: nextCode },
    });

    const ip = clientIp(req);
    await audit(
      prisma,
      session.userId,
      "ADMIN_SET_WITHDRAWAL_CODE",
      ip,
      `Admin ${session.email} set withdrawal code for ${user.email} to ${nextCode ? "custom code" : "default (" + DEFAULT_WITHDRAWAL_CODE + ")"}`,
      userId
    );

    return NextResponse.json({
      success: true,
      withdrawalCode: nextCode,
      effectiveCode: nextCode || DEFAULT_WITHDRAWAL_CODE,
      message: nextCode
        ? `Custom withdrawal code set for ${user.email}.`
        : `Reverted to default withdrawal code (${DEFAULT_WITHDRAWAL_CODE}) for ${user.email}.`,
    });
  } catch (error) {
    console.error("Set withdrawal code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
