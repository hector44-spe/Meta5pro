import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { CopyExpert } from "@/types/copy-trading";
import { normalizeExpertPicture, normalizeExpertPictures } from "@/lib/copy-expert-image";
import { getCatalogExperts, saveCatalogExpert, setCatalogExpertSubscription } from "@/lib/relational-catalogs";

export const dynamic = "force-dynamic";

export type { CopyExpert };

async function getStoredExperts(): Promise<CopyExpert[]> {
  return normalizeExpertPictures(await getCatalogExperts()) as CopyExpert[];
}

async function saveStoredExperts(experts: CopyExpert[]): Promise<void> {
  for (const expert of experts) await saveCatalogExpert(expert);
}

// GET: list experts and current user info
export async function GET() {
  try {
    const session = await getSession();
    const experts = await getStoredExperts();

    return NextResponse.json(
      {
        success: true,
        experts,
        userId: session?.userId || "user_guest",
        isAdmin: session?.role === "ADMIN",
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (err: any) {
    console.error("Error fetching copy trading experts:", err);
    return NextResponse.json(
      { error: "Failed to fetch experts" },
      { status: 500 }
    );
  }
}

// PUT: Admin save/update or delete an expert
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin only." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, expert, expertId } = body;
    let experts = await getStoredExperts();

    if (action === "delete") {
      if (!expertId) {
        return NextResponse.json(
          { error: "Missing expertId to delete" },
          { status: 400 }
        );
      }
      experts = experts.filter(
        (e) => e.id !== expertId && e.ref !== expertId
      );
      await prisma.copyExpert.deleteMany({ where: { OR: [{ id: expertId }, { ref: expertId }] } });
      return NextResponse.json({ success: true, experts });
    }

    if (action === "save") {
      if (!expert || !expert.name) {
        return NextResponse.json(
          { error: "Invalid expert data" },
          { status: 400 }
        );
      }

      const id = expert.id || expert.ref || `expert_${Date.now()}`;
      const existingIdx = experts.findIndex(
        (e) => e.id === id || e.ref === id
      );

      const expertPayload: CopyExpert = {
        id,
        ref: expert.ref || id,
        name: expert.name,
        username: expert.username || "",
        picture: normalizeExpertPicture(expert.picture, id),
        bio: expert.bio || "",
        winRate: Number(expert.winRate) || 0,
        profitShare: Number(expert.profitShare) || 0,
        wins: Number(expert.wins) || 0,
        losses: Number(expert.losses) || 0,
        tradesCount: Number(expert.tradesCount) || 0,
        minimumStartUp: Number(expert.minimumStartUp) || 0,
        followers: Number(expert.followers) || 0,
        tickType: expert.tickType || "none",
        subscriberList: Array.isArray(expert.subscriberList)
          ? expert.subscriberList
          : existingIdx >= 0
          ? experts[existingIdx].subscriberList
          : [],
      };

      if (existingIdx >= 0) {
        experts[existingIdx] = expertPayload;
      } else {
        experts.unshift(expertPayload);
      }

      await saveStoredExperts(experts);
      return NextResponse.json({ success: true, experts });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error managing expert:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Copy or Cancel copying an expert for the current user
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Please log in to copy an expert." },
        { status: 401 }
      );
    }

    const { expertId, action } = await req.json();
    if (!expertId || !action) {
      return NextResponse.json(
        { error: "Missing expertId or action" },
        { status: 400 }
      );
    }

    const experts = await getStoredExperts();
    const idx = experts.findIndex(
      (e) => e.id === expertId || e.ref === expertId
    );

    if (idx === -1) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }

    const target = experts[idx];
    const subList = Array.isArray(target.subscriberList)
      ? [...target.subscriberList]
      : [];

    if (action === "copy") {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { wallet: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const balance = Number(user.wallet?.mainBalance || 0);
      if (target.minimumStartUp && balance < target.minimumStartUp) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Minimum startup is $${target.minimumStartUp.toLocaleString()}`,
          },
          { status: 400 }
        );
      }

      if (!subList.includes(session.userId)) {
        subList.push(session.userId);
        target.followers = Number(target.followers || 0) + 1;
      }
    } else if (action === "cancel") {
      const uIndex = subList.indexOf(session.userId);
      if (uIndex !== -1) {
        subList.splice(uIndex, 1);
        target.followers = Math.max(0, Number(target.followers || 0) - 1);
      }
    }

    target.subscriberList = subList;
    await setCatalogExpertSubscription(target.id, session.userId, action === "copy");
    const refreshed = (await getStoredExperts()).find((item) => item.id === target.id) ?? target;

    return NextResponse.json({
      success: true,
      message:
        action === "copy"
          ? "Expert copied successfully!"
          : "Copying cancelled successfully.",
      expert: refreshed,
    });
  } catch (err: any) {
    console.error("Error in copy trading action:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
