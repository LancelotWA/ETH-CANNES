"use client";

import { useAccount } from "wagmi";
import { useEffect, useRef, useState } from "react";

import { WalletConnection } from "@/components/wallet/wallet-connection";
import { SoftAurora } from "@/components/ui/soft-aurora";
import { IcebergLogo } from "@/components/ui/iceberg-logo";
import { useAppStore } from "@/store/useAppStore";

// Aurora configs
const AURORA_NIGHT = {
  color1: "#0008ff",
  color2: "#e100ff",
  speed: 0.6,
  scale: 1.5,
  brightness: 1,
  noiseFrequency: 2.5,
  noiseAmplitude: 1,
  bandHeight: 0.5,
  bandSpread: 1,
  octaveDecay: 0.1,
  layerOffset: 0,
  colorSpeed: 1,
  enableMouseInteraction: true,
  mouseInfluence: 1,
};

const AURORA_DAY = {
  color1: "#0055ff",
  color2: "#ff5500",
  speed: 0.5,
  scale: 1.5,
  brightness: 2.2,
  noiseFrequency: 2.0,
  noiseAmplitude: 0.9,
  bandHeight: 0.55,
  bandSpread: 1,
  octaveDecay: 0.1,
  layerOffset: 0.1,
  colorSpeed: 0.9,
  enableMouseInteraction: true,
  mouseInfluence: 1,
};

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const adminBypass = useAppStore((s) => s.adminBypass);
  const [mounted, setMounted] = useState(false);

  // Local cycle state — independent from global mode toggle
  const [isNight, setIsNight] = useState(true);
  // Opacity of the "night" aurora layer (1 = fully night, 0 = fully day)
  const [nightOpacity, setNightOpacity] = useState(1);
  const rafRef = useRef<number>(0);
  const targetRef = useRef(1); // 1 = night, 0 = day
  const currentRef = useRef(1);

  const setGlobalPaymentMode = useAppStore((s) => s.setGlobalPaymentMode);

  useEffect(() => { setMounted(true); }, []);

  // Force public mode when connecting
  useEffect(() => {
    if (isConnected) {
      setGlobalPaymentMode("PUBLIC");
    }
  }, [isConnected, setGlobalPaymentMode]);

  // Auto-cycle every 5 s — ONLY on the landing page
  useEffect(() => {
    if (!mounted || isConnected) return;

    const tick = setInterval(() => {
      setIsNight((prev) => {
        const next = !prev;
        targetRef.current = next ? 1 : 0;
        return next;
      });
    }, 5000);

    return () => clearInterval(tick);
  }, [mounted, isConnected]);

  // Smooth opacity lerp via rAF
  useEffect(() => {
    if (!mounted || isConnected) return;

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const delta = target - current;

      if (Math.abs(delta) > 0.001) {
        currentRef.current = current + delta * 0.035; // ~1.5 s lerp
        setNightOpacity(currentRef.current);
      } else {
        currentRef.current = target;
        setNightOpacity(target);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted, isConnected]);

  if (!mounted) return null;

  if (adminBypass) return <>{children}</>;

  if (!isConnected) {
    // Interpolate background from dark (#0B0B0C) to light (#F0F0F8)
    const nightBg = [11, 11, 12];
    const dayBg = [200, 210, 240];
    const bg = nightBg.map((n, i) =>
      Math.round(n * nightOpacity + dayBg[i] * (1 - nightOpacity))
    );
    const bgColor = `rgb(${bg[0]},${bg[1]},${bg[2]})`;

    // ICEBERG title: white (night) → blue #2563EB (day)
    const titleNight = [255, 255, 255];
    const titleDay   = [37, 99, 235];
    const titleRgb = titleNight.map((n, i) =>
      Math.round(n * nightOpacity + titleDay[i] * (1 - nightOpacity))
    );
    const textColor = `rgb(${titleRgb[0]},${titleRgb[1]},${titleRgb[2]})`;

    // Button: purple #7C3AED (night) → blue #2563EB (day)
    const btnNight  = [124, 58, 237];
    const btnNight2 = [99, 102, 241];
    const btnDay    = [37, 99, 235];
    const btnDay2   = [59, 130, 246];
    const btn1 = btnNight.map((n, i) => Math.round(n * nightOpacity + btnDay[i]  * (1 - nightOpacity)));
    const btn2 = btnNight2.map((n, i) => Math.round(n * nightOpacity + btnDay2[i] * (1 - nightOpacity)));
    const shadowNight = [124, 58, 237];
    const shadowDay   = [37, 99, 235];
    const shadow = shadowNight.map((n, i) => Math.round(n * nightOpacity + shadowDay[i] * (1 - nightOpacity)));
    const buttonStyle: React.CSSProperties = {
      background: `linear-gradient(135deg,rgb(${btn1.join(",")}),rgb(${btn2.join(",")}))`,
      boxShadow: `0 8px 24px rgba(${shadow.join(",")},0.4)`,
    };

    const mutedColor =
      nightOpacity > 0.5
        ? `rgba(255,255,255,${0.3 + nightOpacity * 0.4})`
        : `rgba(0,0,0,${0.2 + (1 - nightOpacity) * 0.35})`;

    const borderColor =
      nightOpacity > 0.5
        ? `rgba(255,255,255,${0.08 + nightOpacity * 0.06})`
        : `rgba(0,0,0,${0.06 + (1 - nightOpacity) * 0.06})`;

    return (
      <div
        className="min-h-[100dvh] w-full flex flex-col items-center justify-between px-6 py-12 relative z-50 overflow-hidden"
        style={{
          backgroundColor: bgColor,
          transition: "background-color 0ms", // rAF handles it
        }}
      >
        {/* ── AURORA BACKGROUND ─────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: nightOpacity, transition: "none" }}
        >
          <SoftAurora {...AURORA_NIGHT} />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 1 - nightOpacity, transition: "none" }}
        >
          <SoftAurora {...AURORA_DAY} />
        </div>

        {/* ── CONTENT (above aurora) ─────────────────────────── */}
        <div className="relative z-10 w-full" />

        <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
          {/* Logo + Title */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <IcebergLogo nightOpacity={nightOpacity} size={80} />
            </div>
            <h1
              className="text-[3rem] font-bold tracking-tight leading-none flex items-baseline justify-center"
              style={{ color: textColor, transition: "color 0ms" }}
            >
              {"ICEBERG".split("").map((letter, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: i === 4 ? "scaleX(-1)" : undefined,
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>
            <p
              className="text-sm font-mono mt-3"
              style={{ color: mutedColor, transition: "color 0ms" }}
            >
              Private &amp; social crypto payments
            </p>
          </div>

          {/* Mode indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
            style={{
              background:
                nightOpacity > 0.5
                  ? "rgba(124,58,237,0.18)"
                  : "rgba(37,99,235,0.12)",
              border: `1px solid ${borderColor}`,
              color: nightOpacity > 0.5 ? "#A78BFA" : "#2563EB",
              transition: "background 0ms, color 0ms",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: nightOpacity > 0.5 ? "#A78BFA" : "#2563EB",
                boxShadow:
                  nightOpacity > 0.5
                    ? "0 0 6px rgba(167,139,250,0.8)"
                    : "0 0 6px rgba(37,99,235,0.6)",
              }}
            />
            {isNight ? "PRIVATE MODE" : "PUBLIC MODE"}
          </div>

          {/* Connect button */}
          <WalletConnection buttonStyle={buttonStyle} />
        </div>

        {/* ── BOTTOM ─────────────────────────────────────────── */}
        <p
          className="relative z-10 text-[11px] font-mono text-center"
          style={{ color: mutedColor, transition: "color 0ms" }}
        >
          Non-custodial · Open source · Base Sepolia
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
