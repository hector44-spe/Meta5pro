import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCatalogPlans } from "@/lib/relational-catalogs";

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

    const plans = await getCatalogPlans();

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

    if (action === "save") {
      if (!plan?.id || !plan?.name) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      await prisma.subscriptionPlanConfig.upsert({ where: { id: plan.id }, update: { name: plan.name, title: plan.title, minimum: Number(plan.minimum), maximum: Number(plan.maximum), duration: Number(plan.duration), roi: Number(plan.roi), placeholder: Number(plan.placeholder ?? plan.minimum), active: true }, create: { id: plan.id, name: plan.name, title: plan.title, minimum: Number(plan.minimum), maximum: Number(plan.maximum), duration: Number(plan.duration), roi: Number(plan.roi), placeholder: Number(plan.placeholder ?? plan.minimum) } });
    } else if (action === "delete") {
      await prisma.subscriptionPlanConfig.updateMany({ where: { id: planId }, data: { active: false } });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedPlans = await getCatalogPlans();

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
