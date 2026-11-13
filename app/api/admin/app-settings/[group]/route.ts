export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession, clientIp } from "@/lib/auth";
import { SETTING_GROUPS, getSettings, isSettingGroup } from "@/lib/appSettings";

/** Read a settings group (admin only). */
export async function GET(_req: Request, { params }: { params: Promise<{ group: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  const { group } = await params;
  if (!isSettingGroup(group)) return NextResponse.json({ error: "Unknown settings group" }, { status: 404 });
  return NextResponse.json({ success: true, settings: await getSettings(group) });
}

/** Save a settings group (admin only). Every change is recorded in the activity log. */
export async function PUT(req: Request, { params }: { params: Promise<{ group: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    const { group } = await params;
    if (!isSettingGroup(group)) return NextResponse.json({ error: "Unknown settings group" }, { status: 404 });

    const parsed = SETTING_GROUPS[group].schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid settings" }, { status: 400 });
    }

    const before = await getSettings(group);
    const changes = Object.entries(parsed.data)
      .filter(([k, v]) => (before as Record<string, unknown>)[k] !== v)
      .map(([k, v]) => `${k}: ${String((before as Record<string, unknown>)[k])} -> ${String(v)}`);

    if (changes.length === 0) {
      return NextResponse.json({ success: true, settings: before, unchanged: true });
    }

    await prisma.$transaction([
      prisma.appSetting.upsert({
        where: { key: group },
        create: { key: group, value: parsed.data as Prisma.InputJsonValue, updatedBy: session.userId },
        update: { value: parsed.data as Prisma.InputJsonValue, updatedBy: session.userId },
      }),
      prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: `ADMIN_SETTINGS_${group.toUpperCase()}_UPDATED`,
          ipAddress: clientIp(req),
          details: `${session.email} changed ${group} settings: ${changes.join(", ")}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, settings: parsed.data });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
