export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTradeConfig } from "@/lib/trade-config";
import { closePositionAndSettle } from "@/lib/trade-settlement";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawPositions = await prisma.position.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    const now = Date.now();
    const positions = await Promise.all(
      rawPositions.map(async (p) => {
        const config = await getTradeConfig(p.id);

        // Check if duration expired and position should auto-close
        if (p.status === "OPEN" && config?.closeAt) {
          const expiryTime = new Date(config.closeAt).getTime();
          if (now >= expiryTime) {
            try {
              await closePositionAndSettle({ positionId: p.id });
              p.status = "CLOSED";
              p.closedAt = new Date();
              if (config.isCustomPnl && typeof config.customPnl === "number") {
                p.pnl = config.customPnl as any;
              }
            } catch (err) {
              console.error(`Auto-close error for position ${p.id}:`, err);
            }
          }
        }

        return {
          ...p,
          duration: config?.duration || null,
          closeAt: config?.closeAt || null,
          customPnl: config?.customPnl ?? null,
          isCustomPnl: Boolean(config?.isCustomPnl),
        };
      })
    );

    return NextResponse.json({
      success: true,
      positions,
    });
  } catch (error) {
    console.error("Fetch positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
