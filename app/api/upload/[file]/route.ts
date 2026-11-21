export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMediaObject } from "@/lib/cloudflare-r2";

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
  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let isConfiguredDepositQr = false;
  if (session.role !== "ADMIN" && upload.userId !== session.userId) {
    const settings = await prisma.appSetting.findMany({
      where: { key: { in: ["deposit_address_qrs", "signal_deposit_addresses"] } },
      select: { value: true },
    });
    isConfiguredDepositQr = settings.some(({ value }) =>
      value ? JSON.stringify(value).includes(file) : false
    );
  }
  if (session.role !== "ADMIN" && upload.userId !== session.userId && !isConfiguredDepositQr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = upload.objectKey
    ? (await getMediaObject(upload.objectKey)).bytes
    : upload.data
      ? new Uint8Array(upload.data)
      : null;
  if (!bytes) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const responseBody = Uint8Array.from(bytes).buffer;
  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
