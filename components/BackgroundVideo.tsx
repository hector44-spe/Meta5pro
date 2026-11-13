"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Decorative background video that never delays the page:
 * - renders only the poster image at first
 * - attaches the video source after the page has finished loading
 * - stays a still image on small screens, data-saver mode, or reduced-motion
 */
export default function BackgroundVideo({
  src,
  poster,
  style,
}: {
  src: string;
  poster: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const slow = nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
    const small = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (slow || small || reduced) return;

    const start = () => setEnabled(true);
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 300);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    if (enabled) ref.current?.play().catch(() => {});
  }, [enabled]);

  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} style={style} aria-hidden="true">
      {enabled && <source src={src} type="video/mp4" />}
    </video>
  );
}
