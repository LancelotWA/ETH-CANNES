"use client";

import { useEffect, useRef } from "react";

export interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    : [0, 0, 255];
}

/** Smooth value noise in [−1, 1] via overlapping sine harmonics */
function smoothNoise(x: number, y: number, t: number, freq: number, decay: number): number {
  let v = 0;
  let amp = 1;
  let total = 0;
  for (let o = 0; o < 4; o++) {
    const f = freq * Math.pow(2, o);
    const a = amp * Math.pow(decay + 0.5, o);
    v +=
      Math.sin(x * f * 1.73 + t * 0.7 + o * 0.9) * a * 0.4 +
      Math.sin(y * f * 2.17 + t * 0.5 + o * 1.4) * a * 0.3 +
      Math.sin((x + y) * f * 1.31 + t * 1.1 + o * 0.6) * a * 0.3;
    total += a;
    amp *= 0.6;
  }
  return v / total;
}

export function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1,
  color1 = "#0008ff",
  color2 = "#e100ff",
  noiseFrequency = 2.5,
  noiseAmplitude = 1,
  bandHeight = 0.5,
  bandSpread = 1,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1,
  enableMouseInteraction = false,
  mouseInfluence = 1,
}: SoftAuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      };
    };
    if (enableMouseInteraction) canvas.addEventListener("mousemove", onMouse);

    let t = 0;

    const draw = () => {
      t += speed * 0.008;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      const NUM_BANDS = 6;

      for (let b = 0; b < NUM_BANDS; b++) {
        const bOff = b / NUM_BANDS + layerOffset;
        const tBand = t * colorSpeed + b * 0.7;

        // Build aurora band path with noise-displaced points
        const STEPS = 60;
        ctx.beginPath();

        for (let i = 0; i <= STEPS; i++) {
          const px = (i / STEPS) * W;
          const nx = (i / STEPS) * scale * noiseFrequency;
          const ny = bOff * noiseFrequency;
          const n = smoothNoise(nx, ny, tBand, 1, octaveDecay) * noiseAmplitude;

          // Mouse pushes bands up/down
          const mouseY = enableMouseInteraction
            ? (mouse.current.y - 0.5) * H * 0.3 * mouseInfluence
            : 0;

          const centerY = H * (0.3 + bOff * 0.5 * bandSpread) + mouseY;
          const py = centerY + n * H * 0.12;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Close path into a band ribbon
        for (let i = STEPS; i >= 0; i--) {
          const px = (i / STEPS) * W;
          const nx = (i / STEPS) * scale * noiseFrequency;
          const ny = bOff * noiseFrequency;
          const n = smoothNoise(nx, ny, tBand + 0.3, 1, octaveDecay) * noiseAmplitude;
          const mouseY = enableMouseInteraction
            ? (mouse.current.y - 0.5) * H * 0.3 * mouseInfluence
            : 0;
          const centerY = H * (0.3 + bOff * 0.5 * bandSpread) + mouseY;
          const py = centerY + n * H * 0.12 + H * bandHeight * 0.25;
          ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Color gradient along X axis with noise-driven color mix
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        const NUM_STOPS = 10;
        for (let s = 0; s <= NUM_STOPS; s++) {
          const sx = s / NUM_STOPS;
          const sn = smoothNoise(sx * scale * noiseFrequency, bOff, tBand * 0.5, 1, octaveDecay);
          const mix = Math.max(0, Math.min(1, sn * 0.5 + 0.5));

          const r = Math.round(c1[0] * mix + c2[0] * (1 - mix));
          const g = Math.round(c1[1] * mix + c2[1] * (1 - mix));
          const bl = Math.round(c1[2] * mix + c2[2] * (1 - mix));

          const alpha =
            (0.15 + Math.abs(sn) * 0.2) *
            brightness *
            (0.6 + bandHeight * 0.6) *
            (1 - b * 0.08);

          grad.addColorStop(sx, `rgba(${r},${g},${bl},${Math.min(1, alpha)})`);
        }

        ctx.fillStyle = grad;
        ctx.filter = `blur(${12 + b * 4}px)`;
        ctx.fill();
        ctx.filter = "none";
      }

      // Ambient central glow
      const n0 = smoothNoise(1, 1, t * 0.4, 1, octaveDecay) * 0.5 + 0.5;
      const rg = Math.round(c1[0] * n0 + c2[0] * (1 - n0));
      const gg = Math.round(c1[1] * n0 + c2[1] * (1 - n0));
      const bg = Math.round(c1[2] * n0 + c2[2] * (1 - n0));
      const radial = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, W * 0.7);
      radial.addColorStop(0, `rgba(${rg},${gg},${bg},${0.18 * brightness})`);
      radial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (enableMouseInteraction) canvas.removeEventListener("mousemove", onMouse);
    };
  }, [
    speed, scale, brightness, color1, color2,
    noiseFrequency, noiseAmplitude, bandHeight, bandSpread,
    octaveDecay, layerOffset, colorSpeed, enableMouseInteraction, mouseInfluence,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
