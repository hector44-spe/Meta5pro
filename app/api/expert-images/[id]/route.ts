export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaObject } from "@/lib/cloudflare-r2";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await prisma.expertImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const bytes = image.objectKey
    ? (await getMediaObject(image.objectKey)).bytes
    : image.data
      ? new Uint8Array(image.data)
      : null;
  if (!bytes) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const responseBody = Uint8Array.from(bytes).buffer;
  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
