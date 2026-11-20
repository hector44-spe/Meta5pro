export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMediaObject } from "@/lib/cloudflare-r2";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; side: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, side } = await params;
  if (side !== "front" && side !== "back") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const submission = await prisma.verificationSubmission.findUnique({ where: { id } });
  if (!submission || (session.role !== "ADMIN" && submission.userId !== session.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const objectKey = side === "front" ? submission.frontObjectKey : submission.backObjectKey;
  const contentType = side === "front" ? submission.frontContentType : submission.backContentType;
  if (!objectKey || !contentType) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const media = await getMediaObject(objectKey);
    return new NextResponse(Uint8Array.from(media.bytes).buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}
