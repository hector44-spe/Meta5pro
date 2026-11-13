export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phoneNumber: z
    .string()
    .trim()
    .max(25)
    .regex(/^[+()\d\s-]*$/, "Phone number can only contain digits, spaces and + ( ) -")
    .optional()
    .or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
});

/** Current user's editable profile. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true, phoneNumber: true, country: true, username: true, createdAt: true },
  });
  return NextResponse.json({ success: true, profile: user });
}

/** Updates name, phone and country. Email changes are not allowed here. */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { fullName, phoneNumber, country } = parsed.data;
    const profile = await prisma.user.update({
      where: { id: session.userId },
      data: { fullName, phoneNumber: phoneNumber || null, country: country || null },
      select: { fullName: true, email: true, phoneNumber: true, country: true },
    });

    await notify(session.userId, "account", "Profile updated", "Your personal details were updated.");

    return NextResponse.json({ success: true, message: "Profile updated", profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
