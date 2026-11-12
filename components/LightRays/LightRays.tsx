"use client";

import React, { useEffect, useRef } from "react";

interface LightRaysProps {
  className?: string;
  raysOrigin?: string;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
}

const VERT_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ]
    : [1, 1, 1];
}

function getOriginAnchor(origin: string, width: number, height: number): { anchor: [number, number]; dir: [number, number] } {
  switch (origin) {
    case "top-left":
      return { anchor: [0, -0.2 * height], dir: [0, 1] };
    case "top-right":
      return { anchor: [width, -0.2 * height], dir: [0, 1] };
    case "left":
      return { anchor: [-0.2 * width, 0.5 * height], dir: [1, 0] };
    case "right":
      return { anchor: [1.2 * width, 0.5 * height], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, 1.2 * height], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * width, 1.2 * height], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [width, 1.2 * height], dir: [0, -1] };
    case "top-center":
    default:
      return { anchor: [0.5 * width, -0.2 * height], dir: [0, 1] };
  }
}

export default function LightRays({
  className = "",
  raysOrigin = "top-center",
  raysColor = "#ffffff",
  raysSpeed = 0.5,
  lightSpread = 0.5,
  rayLength = 2.0,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.05,
  noiseAmount = 0,
  distortion = 0,
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERT_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    // Quad geometry (2 triangles covering -1 to 1)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTime = gl.getUniformLocation(prog, "iTime");
    const uResolution = gl.getUniformLocation(prog, "iResolution");
    const uRayPos = gl.getUniformLocation(prog, "rayPos");
    const uRayDir = gl.getUniformLocation(prog, "rayDir");
    const uRaysColor = gl.getUniformLocation(prog, "raysColor");
    const uRaysSpeed = gl.getUniformLocation(prog, "raysSpeed");
    const uLightSpread = gl.getUniformLocation(prog, "lightSpread");
    const uRayLength = gl.getUniformLocation(prog, "rayLength");
    const uPulsating = gl.getUniformLocation(prog, "pulsating");
    const uFadeDistance = gl.getUniformLocation(prog, "fadeDistance");
    const uSaturation = gl.getUniformLocation(prog, "saturation");
    const uMousePos = gl.getUniformLocation(prog, "mousePos");
    const uMouseInfluence = gl.getUniformLocation(prog, "mouseInfluence");
    const uNoiseAmount = gl.getUniformLocation(prog, "noiseAmount");
    const uDistortion = gl.getUniformLocation(prog, "distortion");

    const colorRgb = hexToRgb(raysColor);

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth * dpr;
      height = container.clientHeight * dpr;
      if (width <= 0 || height <= 0) return;

      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      gl.useProgram(prog);
      if (uResolution) gl.uniform2f(uResolution, width, height);
      const { anchor, dir } = getOriginAnchor(raysOrigin, width, height);
      if (uRayPos) gl.uniform2f(uRayPos, anchor[0], anchor[1]);
      if (uRayDir) gl.uniform2f(uRayDir, dir[0], dir[1]);
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!followMouse) return;
      mousePosRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    if (followMouse) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Render loop
    const startTime = performance.now();
    const render = (time: number) => {
      if (!gl || !prog) return;

      gl.useProgram(prog);

      // Smooth mouse position
      if (followMouse && mouseInfluence > 0) {
        smoothMouseRef.current.x =
          0.92 * smoothMouseRef.current.x + 0.08 * mousePosRef.current.x;
        smoothMouseRef.current.y =
          0.92 * smoothMouseRef.current.y + 0.08 * mousePosRef.current.y;
        if (uMousePos) {
          gl.uniform2f(
            uMousePos,
            smoothMouseRef.current.x,
            smoothMouseRef.current.y
          );
        }
      }

      if (uTime) gl.uniform1f(uTime, (time - startTime) * 0.001);
      if (uRaysColor) gl.uniform3f(uRaysColor, colorRgb[0], colorRgb[1], colorRgb[2]);
      if (uRaysSpeed) gl.uniform1f(uRaysSpeed, raysSpeed);
      if (uLightSpread) gl.uniform1f(uLightSpread, lightSpread);
      if (uRayLength) gl.uniform1f(uRayLength, rayLength);
      if (uPulsating) gl.uniform1f(uPulsating, pulsating ? 1.0 : 0.0);
      if (uFadeDistance) gl.uniform1f(uFadeDistance, fadeDistance);
      if (uSaturation) gl.uniform1f(uSaturation, saturation);
      if (uMouseInfluence) gl.uniform1f(uMouseInfluence, mouseInfluence);
      if (uNoiseAmount) gl.uniform1f(uNoiseAmount, noiseAmount);
      if (uDistortion) gl.uniform1f(uDistortion, distortion);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener("resize", resize);
      if (followMouse) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, [
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
