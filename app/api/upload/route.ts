export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Neon/Postgres stores these as BYTEA; keep them reasonably small.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** Detect the real image type from magic bytes; never trust the client's name or MIME type. */
function sniffImage(buf: Buffer): "image/png" | "image/jpeg" | "image/webp" | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const contentType = sniffImage(buf);
    if (!contentType) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PNG, JPG, or WEBP screenshot." },
        { status: 400 },
      );
    }

    const upload = await prisma.proofUpload.create({
      data: { userId: session.userId, contentType, data: buf },
      select: { id: true },
    });

    return NextResponse.json({ success: true, url: `/api/upload/${upload.id}` });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
