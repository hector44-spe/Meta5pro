export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { deleteMediaObject, isCloudflareR2Configured, putMediaObject } from "@/lib/cloudflare-r2";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function sniffImage(buf: Buffer): "image/png" | "image/jpeg" | "image/webp" | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isCloudflareR2Configured()) {
      return NextResponse.json(
        { error: "Media storage is temporarily unavailable" },
        { status: 503 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Expert images must be smaller than 5 MB" }, { status: 400 });
    }

    const data = Buffer.from(await file.arrayBuffer());
    const contentType = sniffImage(data);
    if (!contentType) {
      return NextResponse.json({ error: "Upload a PNG, JPG, or WEBP image" }, { status: 400 });
    }

    const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
    const objectKey = `public/expert-images/${randomUUID()}.${extension}`;
    await putMediaObject(objectKey, data, contentType);

    let image;
    try {
      image = await prisma.expertImage.create({ data: { objectKey, contentType } });
    } catch (error) {
      await deleteMediaObject(objectKey).catch(() => undefined);
      throw error;
    }
    return NextResponse.json({ success: true, url: `/api/expert-images/${image.id}` });
  } catch (error) {
    console.error("Expert image upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
