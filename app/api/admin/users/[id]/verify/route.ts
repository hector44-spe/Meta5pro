export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession, isAuthorizedAdminEmail, clientIp } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/ledger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const body = await request.json().catch(() => ({}));
    const verified = Boolean(body.verified);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, fullName: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (verified) {
      // Find existing submission or create new APPROVED verification
      const existing = await prisma.verificationSubmission.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        await prisma.verificationSubmission.update({
          where: { id: existing.id },
          data: {
            status: "APPROVED",
            rejectionReason: null,
            reviewedBy: session.userId,
            reviewedAt: new Date(),
          },
        });
      } else {
        await prisma.verificationSubmission.create({
          data: {
            userId: targetUserId,
            documentType: "ADMIN_VERIFIED",
            frontObjectKey: `admin-verified-${targetUserId}-${Date.now()}`,
            frontContentType: "application/json",
            status: "APPROVED",
            reviewedBy: session.userId,
            reviewedAt: new Date(),
          },
        });
      }

      await notify(
        targetUserId,
        "account",
        "Account verified",
        "Your account has been officially verified by administration.",
      );

      await audit(
        prisma,
        session.userId,
        "ADMIN_USER_VERIFIED",
        clientIp(request),
        `Admin ${session.email} approved account verification for ${user.fullName || user.email} (${user.id})`,
        targetUserId,
      );

      return NextResponse.json({ success: true, isVerified: true, message: "Account marked as verified." });
    } else {
      // Un-verify user
      await prisma.verificationSubmission.updateMany({
        where: { userId: targetUserId },
        data: {
          status: "REJECTED",
          rejectionReason: "Verification revoked by administrator.",
          reviewedBy: session.userId,
          reviewedAt: new Date(),
        },
      });

      await audit(
        prisma,
        session.userId,
        "ADMIN_USER_UNVERIFIED",
        clientIp(request),
        `Admin ${session.email} revoked account verification for ${user.fullName || user.email} (${user.id})`,
        targetUserId,
      );

      return NextResponse.json({ success: true, isVerified: false, message: "Account verification removed." });
    }
  } catch (error: any) {
    console.error("Admin user verify error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
