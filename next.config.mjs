const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy: only the third parties the app actually uses are allowed.
 * - TradingView: chart widgets (script + iframes)
 * - Google Translate: language picker
 * - Google Fonts: fonts
 * 'unsafe-inline' is needed for Next.js bootstrap scripts and the app's many inline styles;
 * 'unsafe-eval' and ws: only in development (React Refresh / HMR).
 */
const csp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    "https://s3.tradingview.com",
    "https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://translate.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  [
    "connect-src 'self'",
    "https://translate.googleapis.com https://translate-pa.googleapis.com",
    isDev ? "ws: wss:" : "",
  ].join(" "),
  "frame-src https://*.tradingview.com https://*.tradingview-widget.com https://translate.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Lets a production build run alongside `next dev` without both writing to .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  devIndicators: false,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shake icon imports so only the icons used are bundled
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
