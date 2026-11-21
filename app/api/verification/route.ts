export const dynamic = "force-dynamic";

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteMediaObject, isCloudflareR2Configured, putMediaObject } from "@/lib/cloudflare-r2";
import { prisma } from "@/lib/prisma";
import {
  extensionForVerificationFile,
  MAX_VERIFICATION_FILE_SIZE,
  sniffVerificationFile,
} from "@/lib/verification-file";

const DOCUMENT_TYPES = new Set(["passport", "drivers_license", "national_id", "birth_certificate"]);

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submission = await prisma.verificationSubmission.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      documentType: true,
      status: true,
      rejectionReason: true,
      reviewedAt: true,
      createdAt: true,
      backObjectKey: true,
    },
  });

  return NextResponse.json({
    submission: submission
      ? {
          ...submission,
          hasBack: Boolean(submission.backObjectKey),
          backObjectKey: undefined,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCloudflareR2Configured()) {
    return NextResponse.json({ error: "Document storage is temporarily unavailable" }, { status: 503 });
  }

  const current = await prisma.verificationSubmission.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  if (current?.status === "PENDING") {
    return NextResponse.json({ error: "Your verification is already awaiting review." }, { status: 409 });
  }
  if (current?.status === "APPROVED") {
    return NextResponse.json({ error: "Your account is already verified." }, { status: 409 });
  }

  const form = await request.formData();
  const documentType = String(form.get("documentType") || "");
  const front = form.get("front");
  const back = form.get("back");
  if (!DOCUMENT_TYPES.has(documentType)) {
    return NextResponse.json({ error: "Select a valid document type." }, { status: 400 });
  }
  if (!(front instanceof File)) {
    return NextResponse.json({ error: "Upload the front/photo page of your document." }, { status: 400 });
  }
  if (back !== null && !(back instanceof File)) {
    return NextResponse.json({ error: "Invalid back document." }, { status: 400 });
  }

  const files = [front, ...(back instanceof File && back.size > 0 ? [back] : [])];
  const prepared = [];
  for (const file of files) {
    if (file.size > MAX_VERIFICATION_FILE_SIZE) {
      return NextResponse.json({ error: "Each document must be 8MB or smaller." }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const contentType = sniffVerificationFile(bytes);
    if (!contentType) {
      return NextResponse.json({ error: "Documents must be JPG, PNG, WEBP, or PDF files." }, { status: 400 });
    }
    prepared.push({ bytes, contentType });
  }

  const prefix = `private/identity-verification/${session.userId}/${randomUUID()}`;
  const frontKey = `${prefix}-front.${extensionForVerificationFile(prepared[0].contentType)}`;
  const backKey = prepared[1]
    ? `${prefix}-back.${extensionForVerificationFile(prepared[1].contentType)}`
    : null;

  const uploadedKeys: string[] = [];
  try {
    await putMediaObject(frontKey, prepared[0].bytes, prepared[0].contentType);
    uploadedKeys.push(frontKey);
    if (prepared[1] && backKey) {
      await putMediaObject(backKey, prepared[1].bytes, prepared[1].contentType);
      uploadedKeys.push(backKey);
    }

    const submission = await prisma.verificationSubmission.create({
      data: {
        userId: session.userId,
        documentType,
        frontObjectKey: frontKey,
        frontContentType: prepared[0].contentType,
        backObjectKey: backKey,
        backContentType: prepared[1]?.contentType ?? null,
      },
      select: { id: true, status: true, createdAt: true },
    });
    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    await Promise.all(uploadedKeys.map((key) => deleteMediaObject(key).catch(() => undefined)));
    console.error("Verification upload failed:", error);
    return NextResponse.json({ error: "Verification upload failed." }, { status: 500 });
  }
}
