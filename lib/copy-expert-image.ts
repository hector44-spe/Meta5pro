const FALLBACKS = [
  "/assets/copy-trading/albania_support.png",
  "/assets/copy-trading/alex_avatar.png",
  "/assets/copy-trading/IMG_3760.jpeg2026-07-27T02_13_59.718Z.jpg",
  "/assets/copy-trading/IMG_3771.jpeg2026-08-09T12_42_24.264Z.jpg",
  "/assets/copy-trading/IMG_3981.jpeg2026-07-29T15_18_44.438Z.jpg",
  "/assets/copy-trading/IMG_4526.jpeg2026-08-12T11_05_05.551Z.jpg",
  "/assets/copy-trading/IMG_5563.jpeg2026-09-04T11_07_14.563Z.jpg",
  "/assets/copy-trading/IMG_5629.jpeg2026-07-31T20_46_38.350Z.jpg",
  "/assets/copy-trading/IMG_6031.jpeg2026-10-08T06_37_03.492Z.jpg",
  "/assets/copy-trading/IMG_6507.jpeg2026-07-21T16_09_48.562Z.jpg",
  "/assets/copy-trading/IMG_6573.jpeg2026-07-21T14_28_38.992Z.jpg",
  "/assets/copy-trading/IMG_6602.jpeg2026-07-22T00_38_35.655Z.jpg",
  "/assets/copy-trading/IMG_6734.jpeg2026-07-27T00_39_26.765Z.jpg",
  "/assets/copy-trading/IMG_6749.jpeg2026-07-28T06_24_53.336Z.jpg",
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
  if (picture.startsWith("/assets/") || picture.startsWith("/dashboard_files/") || picture.startsWith("/api/expert-images/")) {
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

/** Ensures missing/broken duplicate sources do not make multiple experts share one avatar. */
export function normalizeExpertPictures<T extends { picture?: unknown; id?: string; ref?: string; name?: string }>(experts: T[]): T[] {
  const used = new Set<string>();
  return experts.map((expert, index) => {
    let picture = normalizeExpertPicture(expert.picture, expert.id || expert.ref || expert.name || String(index));
    if (used.has(picture)) {
      picture = FALLBACKS.find((candidate) => !used.has(candidate)) || picture;
    }
    used.add(picture);
    return { ...expert, picture };
  });
}
