"use client";

import React, { useEffect, useRef } from "react";

interface ColorBendsProps {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
}

export default function ColorBends({
  className = "",
  style = {},
  colors = ["#7132F5", "#31ACEE", "#DB33DB", "#4C94FF", "#01B28B"],
}: ColorBendsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || {
        width: window.innerWidth,
        height: 600,
      };
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += 0.003;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      // Base dark layer
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Save context for smooth composite blending
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Wave 1: Purple / Violet flowing bend
      const grad1 = ctx.createRadialGradient(
        w * 0.35 + Math.sin(time * 0.8) * 120,
        h * 0.45 + Math.cos(time * 0.6) * 80,
        10,
        w * 0.35 + Math.sin(time * 0.8) * 120,
        h * 0.45 + Math.cos(time * 0.6) * 80,
        w * 0.55,
      );
      grad1.addColorStop(0, "rgba(113, 50, 245, 0.32)");
      grad1.addColorStop(0.5, "rgba(113, 50, 245, 0.12)");
      grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Wave 2: Cyan / Blue energetic streak
      const grad2 = ctx.createRadialGradient(
        w * 0.65 + Math.cos(time * 0.7) * 140,
        h * 0.35 + Math.sin(time * 0.9) * 90,
        20,
        w * 0.65 + Math.cos(time * 0.7) * 140,
        h * 0.35 + Math.sin(time * 0.9) * 90,
        w * 0.6,
      );
      grad2.addColorStop(0, "rgba(49, 172, 238, 0.28)");
      grad2.addColorStop(0.5, "rgba(49, 172, 238, 0.08)");
      grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Wave 3: Magenta / Crimson subtle ray
      const grad3 = ctx.createRadialGradient(
        w * 0.5 + Math.sin(time * 0.5) * 100,
        h * 0.2 + Math.cos(time * 0.7) * 60,
        15,
        w * 0.5 + Math.sin(time * 0.5) * 100,
        h * 0.2 + Math.cos(time * 0.7) * 60,
        w * 0.45,
      );
      grad3.addColorStop(0, "rgba(219, 51, 219, 0.22)");
      grad3.addColorStop(0.6, "rgba(219, 51, 219, 0.05)");
      grad3.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);

      // Diagonal Aurora Light Streaks (Color Bends)
      ctx.lineWidth = 120;
      ctx.filter = "blur(60px)";

      ctx.beginPath();
      ctx.moveTo(-100, h * 0.1 + Math.sin(time) * 40);
      ctx.bezierCurveTo(
        w * 0.3,
        h * 0.6 + Math.cos(time * 0.8) * 60,
        w * 0.7,
        h * 0.2 + Math.sin(time * 0.9) * 60,
        w + 100,
        h * 0.7 + Math.cos(time) * 50,
      );
      const strokeGrad = ctx.createLinearGradient(0, 0, w, h);
      strokeGrad.addColorStop(0, "rgba(113, 50, 245, 0.18)");
      strokeGrad.addColorStop(0.4, "rgba(49, 172, 238, 0.22)");
      strokeGrad.addColorStop(0.7, "rgba(219, 51, 219, 0.18)");
      strokeGrad.addColorStop(1, "rgba(1, 178, 139, 0.15)");
      ctx.strokeStyle = strokeGrad;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [colors]);

  return (
    <div
      className={`color-bends-container ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 50%, transparent 100%)",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
