export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** Latest notifications for the signed-in user, plus the unread count. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, kind: true, title: true, body: true, read: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
  ]);

  if (session.status === "FROZEN") {
    const hasFrozenNotif = notifications.some(
      (n) => n.kind === "frozen" || n.title.toLowerCase().includes("frozen"),
    );
    if (!hasFrozenNotif) {
      try {
        const notif = await prisma.notification.create({
          data: {
            userId: session.userId,
            kind: "frozen",
            title: "Your account is frozen, contact support for more info",
            body: "Your account is frozen, contact support for more info",
            read: false,
          },
          select: { id: true, kind: true, title: true, body: true, read: true, createdAt: true },
        });
        notifications = [notif, ...notifications];
        unread += 1;
      } catch (err) {
        console.error("Failed to auto-create frozen notification:", err);
      }
    }
  }

  const cleanedNotifications = notifications.map((n) => ({
    ...n,
    body: n.body.replace(/\s+after the position was closed by an? administrators?\.?/gi, "."),
  }));
  return NextResponse.json({ success: true, notifications: cleanedNotifications, unread });
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
