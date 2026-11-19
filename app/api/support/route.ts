export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, clientIp, rateLimited } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  conversationId: z.string().uuid().optional(),
}).strict();

const formatMessage = (message: { id: string; sender: string; body: string; createdAt: Date }) => ({
  id: message.id,
  sender: message.sender === "ADMIN" ? "support" : "user",
  text: message.body,
  createdAt: message.createdAt.toISOString(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wantsAll = new URL(req.url).searchParams.get("all") === "1";
  if (wantsAll) {
    if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const conversations = await prisma.supportConversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 200 },
      },
    });
    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        status: conversation.status,
        updatedAt: conversation.updatedAt.toISOString(),
        user: conversation.user,
        messages: conversation.messages.map(formatMessage),
      })),
    });
  }

  const conversation = await prisma.supportConversation.findUnique({
    where: { userId: session.userId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 200 } },
  });
  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    messages: conversation?.messages.map(formatMessage) ?? [],
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (await rateLimited(`support:${clientIp(req)}:${session.userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
  }

  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid message" }, { status: 400 });
  }

  if (session.role === "ADMIN") {
    if (!parsed.data.conversationId) {
      return NextResponse.json({ error: "A conversation is required" }, { status: 400 });
    }
    const exists = await prisma.supportConversation.findUnique({ where: { id: parsed.data.conversationId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.supportMessage.create({
        data: { conversationId: exists.id, sender: "ADMIN", body: parsed.data.message },
      });
      await tx.supportConversation.update({ where: { id: exists.id }, data: { status: "OPEN" } });
      return created;
    });
    return NextResponse.json({ success: true, message: formatMessage(message) });
  }

  const message = await prisma.$transaction(async (tx) => {
    const conversation = await tx.supportConversation.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: { status: "OPEN" },
    });
    return tx.supportMessage.create({
      data: { conversationId: conversation.id, sender: "USER", body: parsed.data.message },
    });
  });
  return NextResponse.json({ success: true, message: formatMessage(message) });
}
