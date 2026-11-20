export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession, isAuthorizedAdminEmail } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (!action) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (action === "reject" && reason.length < 3) {
    return NextResponse.json({ error: "Provide a rejection reason." }, { status: 400 });
  }

  const existing = await prisma.verificationSubmission.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (existing.status !== "PENDING") {
    return NextResponse.json({ error: "This submission has already been reviewed." }, { status: 409 });
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED";
  await prisma.$transaction(async (tx) => {
    await tx.verificationSubmission.update({
      where: { id },
      data: {
        status,
        rejectionReason: action === "reject" ? reason : null,
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      },
    });
    await notify(
      existing.userId,
      "account",
      action === "approve" ? "Account verified" : "Verification needs attention",
      action === "approve"
        ? "Your identity documents have been approved and your account is now verified."
        : `Your identity verification was rejected: ${reason}. You can upload new documents from account verification.`,
      tx,
    );
  });

  return NextResponse.json({ success: true, status });
}
