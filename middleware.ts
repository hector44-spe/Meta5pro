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
  "/investing",
  "/real-estate",
  "/cards",
  "/copy-trading",
  "/stake",
  "/mining",
  "/trade",
  "/trades",
  "/markets",
];

const PROTECTED_ADMIN_PATHS = ["/admin"];

const AUTHORIZED_ADMIN_EMAILS = [
  "support@meta5vip.com",
  "orezimeabed2006@gmail.com",
];

function isAuthorizedAdminEmail(email?: string): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === email.toLowerCase());
}

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

  // 1. Guard Admin Routes: strictly require role === 'ADMIN' and authorized email whitelist
  if (isAdminProtected) {
    if (!payload || payload.role !== "ADMIN" || !isAuthorizedAdminEmail(payload.email)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If the admin account has 2FA enabled, require two-factor verification
    if (payload.twoFactorRequired && !payload.twoFactorVerified) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("step", "2fa");
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
    // If an admin needs 2FA verification, allow them to view /login
    if (payload.role === "ADMIN" && payload.twoFactorRequired && !payload.twoFactorVerified) {
      return NextResponse.next();
    }
    // If authorized admin, redirect to /admin
    if (payload.role === "ADMIN" && isAuthorizedAdminEmail(payload.email)) {
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
    "/investing/:path*",
    "/real-estate/:path*",
    "/cards/:path*",
    "/copy-trading/:path*",
    "/stake/:path*",
    "/mining/:path*",
    "/trade/:path*",
    "/trades/:path*",
    "/markets/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
