export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check for Render (healthCheckPath). Returns 200 when the server is up.
 * The database is pinged, but a slow/cold Neon start only reports "db: degraded",
 * so Render doesn't restart a healthy server while the database is waking up.
 */
export async function GET() {
  let db: "ok" | "degraded" = "ok";
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
  } catch {
    db = "degraded";
  }
  return NextResponse.json({ status: "ok", db }, { headers: { "Cache-Control": "no-store" } });
}
