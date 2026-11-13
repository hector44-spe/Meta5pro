export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** Latest notifications for the signed-in user, plus the unread count. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, kind: true, title: true, body: true, read: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
  ]);
  return NextResponse.json({ success: true, notifications, unread });
}

/** Marks notifications as read: `{ ids: [...] }` for some, or `{ all: true }`. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100) : [];
  if (!body.all && ids.length === 0) {
    return NextResponse.json({ error: "Nothing to mark" }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false, ...(body.all ? {} : { id: { in: ids } }) },
    data: { read: true },
  });
  return NextResponse.json({ success: true });
}
