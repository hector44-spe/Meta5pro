export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession, isAuthorizedAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function categorizeAction(action: string): {
  category: "credit" | "debit" | "asset" | "status" | "verification" | "settings" | "notification" | "system";
  label: string;
} {
  const a = action.toUpperCase();
  if (a.includes("CREDIT")) {
    if (a.includes("ASSET")) return { category: "asset", label: "Crypto Asset Credit" };
    return { category: "credit", label: "Balance Credit" };
  }
  if (a.includes("DEBIT")) {
    return { category: "debit", label: "Balance Debit" };
  }
  if (a.includes("VERIF") || a.includes("KYC")) {
    return { category: "verification", label: a.includes("UNVERIF") ? "Verification Revoked" : "Account Verified" };
  }
  if (a.includes("STATUS") || a.includes("FROZEN") || a.includes("SUSPENDED") || a.includes("ACTIVE")) {
    return { category: "status", label: "Status Updated" };
  }
  if (a.includes("SETTING") || a.includes("CONFIG") || a.includes("ADDRESS")) {
    return { category: "settings", label: "Settings Updated" };
  }
  if (a.includes("NOTIF")) {
    return { category: "notification", label: "Notification Sent" };
  }
  if (a.includes("CODE")) {
    return { category: "status", label: "Withdrawal Code Set" };
  }
  if (a.includes("DEPOSIT") && a.includes("APPROV")) {
    return { category: "credit", label: "Deposit Approved" };
  }
  if (a.includes("WITHDRAW") && a.includes("APPROV")) {
    return { category: "debit", label: "Withdrawal Approved" };
  }
  return { category: "system", label: action.replace(/^(ADMIN_|USER_)/, "").replace(/_/g, " ") };
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN" || !isAuthorizedAdminEmail(session.email)) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("q") || "").trim().toLowerCase();
    const categoryFilter = (searchParams.get("category") || "ALL").toUpperCase();

    // Query exclusively for the currently authenticated admin account
    const rawLogs = await prisma.activityLog.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // Fetch target user profiles in a single query
    const targetUserIds = [...new Set(rawLogs.map((l) => l.targetUserId).filter(Boolean))] as string[];
    const targetUsers = targetUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: targetUserIds } },
          select: { id: true, fullName: true, email: true, username: true },
        })
      : [];
    const targetUserMap = new Map(targetUsers.map((u) => [u.id, u]));

    // Format logs
    let logs = rawLogs.map((log) => {
      const meta = categorizeAction(log.action);
      const targetUser = log.targetUserId ? targetUserMap.get(log.targetUserId) || null : null;
      return {
        id: log.id,
        action: log.action,
        actionLabel: meta.label,
        category: meta.category,
        details: log.details || "",
        ipAddress: log.ipAddress || "—",
        createdAt: log.createdAt.toISOString(),
        targetUserId: log.targetUserId,
        targetUser: targetUser
          ? {
              id: targetUser.id,
              fullName: targetUser.fullName,
              email: targetUser.email,
              username: targetUser.username,
            }
          : null,
      };
    });

    // In-memory filter for flexible multi-term search
    if (categoryFilter !== "ALL") {
      logs = logs.filter((l) => l.category.toUpperCase() === categoryFilter);
    }

    if (search) {
      logs = logs.filter((l) => {
        const hay = [
          l.action,
          l.actionLabel,
          l.details,
          l.ipAddress,
          l.targetUser?.email,
          l.targetUser?.fullName,
          l.targetUser?.username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(search);
      });
    }

    return NextResponse.json({
      success: true,
      adminEmail: session.email,
      adminId: session.userId,
      totalCount: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error("Admin audit logs fetch error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
