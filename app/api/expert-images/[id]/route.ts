export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaObject } from "@/lib/cloudflare-r2";

const imageCache = new Map<string, { bytes: Uint8Array; contentType: string }>();
const MAX_CACHED_IMAGES = 32;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cached = imageCache.get(id);
  if (cached) {
    return new NextResponse(Uint8Array.from(cached.bytes).buffer, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "X-Media-Cache": "HIT",
      },
    });
  }
  const image = await prisma.expertImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const bytes = image.objectKey
    ? (await getMediaObject(image.objectKey)).bytes
    : image.data
      ? new Uint8Array(image.data)
      : null;
  if (!bytes) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  if (imageCache.size >= MAX_CACHED_IMAGES) {
    const oldest = imageCache.keys().next().value;
    if (oldest) imageCache.delete(oldest);
  }
  imageCache.set(id, { bytes: Uint8Array.from(bytes), contentType: image.contentType });

  const responseBody = Uint8Array.from(bytes).buffer;
  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "X-Media-Cache": "MISS",
    },
  });
}
