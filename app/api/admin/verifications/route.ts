export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession, isAuthorizedAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const submissions = await prisma.verificationSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, fullName: true, username: true } } },
    });
    return NextResponse.json({
      submissions: submissions.map((item) => ({
        id: item.id,
        userId: item.userId,
        userEmail: item.user.email,
        userName: item.user.fullName || item.user.username,
        documentType: item.documentType,
        status: item.status,
        rejectionReason: item.rejectionReason,
        reviewedAt: item.reviewedAt,
        createdAt: item.createdAt,
        hasBack: Boolean(item.backObjectKey),
      })),
    });
  } catch (error) {
    console.error("[admin-verifications] GET error:", error);
    return NextResponse.json({ error: "Failed to load verification submissions" }, { status: 500 });
  }
}
