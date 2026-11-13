export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Serves a payment proof to its uploader or an admin only. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file } = await params;
  if (!UUID_RE.test(file)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const upload = await prisma.proofUpload.findUnique({ where: { id: file } });
  if (!upload || (session.role !== "ADMIN" && upload.userId !== session.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
