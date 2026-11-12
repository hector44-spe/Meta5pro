"use client";

import React, { useState, useEffect, useRef } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
}

export default function CountUp({
  end,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = "",
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
      setValue(end);
      return;
    }

    const fallbackTimeout = setTimeout(() => {
      if (!hasAnimated) {
        setHasAnimated(true);
        setValue(end);
      }
    }, 2000);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          clearTimeout(fallbackTimeout);
          setHasAnimated(true);

          const startTime = performance.now();
          const frame = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const easeProgress =
              progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = easeProgress * end;
            setValue(current);

            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
              setValue(end);
            }
          };
          requestAnimationFrame(frame);
        }
      },
      { threshold: 0.05, rootMargin: "50px" },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      clearTimeout(fallbackTimeout);
      observer.disconnect();
    };
  }, [end, duration, hasAnimated]);

  const formattedNumber = (() => {
    let numStr = value.toFixed(decimals);
    if (separator) {
      const parts = numStr.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      numStr = parts.join(".");
    }
    return numStr;
  })();

  return (
    <span ref={elementRef}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}
