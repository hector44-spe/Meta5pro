import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeToken } from "@/lib/jwtEdge";

const COOKIE_NAME = process.env.COOKIE_NAME || "mg5_token";

const PROTECTED_USER_PATHS: string[] = [
  "/dashboard",
  "/wallet",
  "/assets",
  "/deposit",
  "/deposits",
  "/withdraw",
  "/withdrawals",
  "/signals",
  "/subscribe",
  "/cold-storage",
];

const PROTECTED_ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files (e.g. /assets/logo.png, /assets/video/bg.mp4 from /public) share URL
  // prefixes with dashboard pages like /assets. Never gate actual files behind login.
  if (/\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isUserProtected = PROTECTED_USER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAdminProtected = PROTECTED_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPage = pathname === "/login" || pathname === "/register";

  let payload = null;
  if (token) {
    payload = await verifyEdgeToken(token);
  }

  // 1. Guard Admin Routes: strictly require role === 'ADMIN'
  if (isAdminProtected) {
    if (!payload || payload.role !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Guard User Dashboard Routes: require valid authenticated session
  if (isUserProtected) {
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Redirect already logged-in users away from /login & /register
  if (isAuthPage && payload) {
    if (payload.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/assets/:path*",
    "/deposit/:path*",
    "/deposits/:path*",
    "/withdraw/:path*",
    "/withdrawals/:path*",
    "/signals/:path*",
    "/subscribe/:path*",
    "/cold-storage/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
