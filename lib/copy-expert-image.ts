const FALLBACKS = [
  "/assets/copy-trading/albania_support.png",
  "/assets/copy-trading/alex_avatar.png",
  "/assets/copy-trading/IMG_3760.jpeg2026-07-27T02_13_59.718Z.jpg",
];

const KNOWN_REMOTE_IMAGES: Record<string, string> = {
  "crypto-tokens-and-crypto-coins-what-drives-performance.png":
    "/assets/copy-trading/Crypto-Tokens-and-Crypto-Coins-What-Drives-Performance.png",
};

/**
 * Expert avatars must be same-origin so browser tracking protection, hot-link
 * blocking and expiring third-party URLs cannot leave blank cards.
 */
export function normalizeExpertPicture(source: unknown, stableKey = "expert"): string {
  const picture = typeof source === "string" ? source.trim() : "";
  if (picture.startsWith("/assets/") || picture.startsWith("/dashboard_files/") || picture.startsWith("/api/upload/")) {
    return picture;
  }

  const lower = picture.toLowerCase();
  for (const [needle, localPath] of Object.entries(KNOWN_REMOTE_IMAGES)) {
    if (lower.includes(needle)) return localPath;
  }

  let hash = 0;
  for (const char of stableKey) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return FALLBACKS[Math.abs(hash) % FALLBACKS.length];
}
