import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeToken } from "@/lib/jwtEdge";

const COOKIE_NAME = process.env.COOKIE_NAME || "mg5_token";

const PROTECTED_USER_PATHS: string[] = [
  // Allow /deposit, /withdraw, /assets, /wallet to be viewed directly for presentation and testing
];

const PROTECTED_ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
