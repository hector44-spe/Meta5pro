import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  title: string;
  minimum: number;
  maximum: number;
  duration: number;
  roi: number;
  placeholder: number;
}

const DEFAULT_PLANS: SubscriptionPlanItem[] = [
  {
    id: "Starter1234",
    name: "Starter",
    title: "Starter plan",
    minimum: 11000,
    maximum: 19500,
    duration: 3,
    roi: 200,
    placeholder: 11000,
  },
  {
    id: "Lite1234",
    name: "Lite",
    title: "Lite plan",
    minimum: 20000,
    maximum: 49500,
    duration: 3,
    roi: 300,
    placeholder: 20000,
  },
  {
    id: "Classic1234",
    name: "Classic",
    title: "Classic plan",
    minimum: 50000,
    maximum: 99500,
    duration: 3,
    roi: 350,
    placeholder: 50000,
  },
  {
    id: "Pro1234",
    name: "Pro",
    title: "Pro plan",
    minimum: 100000,
    maximum: 1000000,
    duration: 3,
    roi: 403,
    placeholder: 100000,
  },
];

export async function GET() {
  try {
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    const setting = await prisma.appSetting.findUnique({
      where: { key: "subscription_plans" },
    });

    let plans: SubscriptionPlanItem[] = DEFAULT_PLANS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      plans = setting.value as unknown as SubscriptionPlanItem[];
    }

    return NextResponse.json({
      success: true,
      plans,
      isAdmin,
    });
  } catch (error) {
    console.error("Fetch subscription plans error:", error);
    return NextResponse.json({
      success: true,
      plans: DEFAULT_PLANS,
      isAdmin: false,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required to edit subscription plans" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, plan, planId } = body;

    const setting = await prisma.appSetting.findUnique({
      where: { key: "subscription_plans" },
    });

    let currentPlans: SubscriptionPlanItem[] = DEFAULT_PLANS;
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      currentPlans = setting.value as unknown as SubscriptionPlanItem[];
    }

    let updatedPlans: SubscriptionPlanItem[];

    if (action === "save") {
      const idx = currentPlans.findIndex((p) => p.id === plan.id);
      if (idx !== -1) {
        updatedPlans = [...currentPlans];
        updatedPlans[idx] = { ...updatedPlans[idx], ...plan };
      } else {
        updatedPlans = [...currentPlans, plan];
      }
    } else if (action === "delete") {
      updatedPlans = currentPlans.filter((p) => p.id !== planId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.appSetting.upsert({
      where: { key: "subscription_plans" },
      update: { value: updatedPlans as any },
      create: { key: "subscription_plans", value: updatedPlans as any },
    });

    return NextResponse.json({
      success: true,
      plans: updatedPlans,
    });
  } catch (error: any) {
    console.error("Save subscription plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save subscription plan" },
      { status: 500 }
    );
  }
}
