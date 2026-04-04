"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef, useState } from "react";
import { SoftAurora } from "@/components/ui/soft-aurora";

const AURORA_PRIVATE = {
  color1: "#0008ff",
  color2: "#e100ff",
  speed: 0.5,
  scale: 1.5,
  brightness: 0.55,
  noiseFrequency: 2.5,
  noiseAmplitude: 1,
  bandHeight: 0.5,
  bandSpread: 1,
  octaveDecay: 0.1,
  layerOffset: 0,
  colorSpeed: 0.8,
  enableMouseInteraction: false,
  mouseInfluence: 0,
};

const AURORA_PUBLIC = {
  color1: "#0055ff",
  color2: "#ff5500",
  speed: 0.4,
  scale: 1.5,
  brightness: 1.6,
  noiseFrequency: 2.0,
  noiseAmplitude: 0.9,
  bandHeight: 0.55,
  bandSpread: 1,
  octaveDecay: 0.1,
  layerOffset: 0.1,
  colorSpeed: 0.7,
  enableMouseInteraction: false,
  mouseInfluence: 0,
};

/**
 * Slide-curtain transition + SoftAurora background.
 *
 * Curtain direction:
 *  → switching to PRIVATE : enters from RIGHT, exits to LEFT
 *  → switching to PUBLIC  : enters from LEFT,  exits to RIGHT
 */
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const [mounted, setMounted] = useState(false);
  const prevMode = useRef<string | null>(null);
  const [curtain, setCurtain] = useState<React.CSSProperties>({ display: "none" });

  // Aurora cross-fade (0 = fully public, 1 = fully private)
  const targetRef  = useRef(1);
  const currentRef = useRef(1);
  const rafRef     = useRef<number>(0);
  const [privateOpacity, setPrivateOpacity] = useState(1);

  useEffect(() => { setMounted(true); }, []);

  // Smooth aurora lerp
  useEffect(() => {
    if (!mounted) return;
    const animate = () => {
      const delta = targetRef.current - currentRef.current;
      if (Math.abs(delta) > 0.001) {
        currentRef.current += delta * 0.03;
        setPrivateOpacity(currentRef.current);
      } else {
        currentRef.current = targetRef.current;
        setPrivateOpacity(targetRef.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted]);

  // Curtain slide + theme class
  useEffect(() => {
    if (!mounted) return;

    if (prevMode.current === null) {
      prevMode.current = globalPaymentMode;
      applyThemeClass(globalPaymentMode);
      targetRef.current  = globalPaymentMode === "PRIVATE" ? 1 : 0;
      currentRef.current = targetRef.current;
      setPrivateOpacity(targetRef.current);
      return;
    }

    targetRef.current = globalPaymentMode === "PRIVATE" ? 1 : 0;

    const toPublic  = globalPaymentMode === "PUBLIC";
    const enterFrom = toPublic ? "-100%" : "100%";
    const exitTo    = toPublic ? "100%"  : "-100%";
    const color     = toPublic ? "#F7F7F8" : "#0B0B0C";

    setCurtain({
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: color,
      transform: `translateX(${enterFrom})`,
      willChange: "transform",
      overflow: "hidden",
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurtain((c) => ({
          ...c,
          transform: "translateX(0)",
          transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
        }));
      });
    });

    const flipTimer = setTimeout(() => {
      applyThemeClass(globalPaymentMode);
      prevMode.current = globalPaymentMode;
    }, 240);

    const outTimer = setTimeout(() => {
      setCurtain((c) => ({
        ...c,
        transform: `translateX(${exitTo})`,
        transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
      }));
    }, 250);

    const hideTimer = setTimeout(() => {
      setCurtain({ display: "none" });
    }, 500);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, [globalPaymentMode, mounted]);

  return (
    <>
      {/* ── AURORA BACKGROUND ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Private aurora */}
        <div
          className="absolute inset-0"
          style={{ opacity: privateOpacity, transition: "none" }}
        >
          <SoftAurora {...AURORA_PRIVATE} />
        </div>
        {/* Public aurora */}
        <div
          className="absolute inset-0"
          style={{ opacity: 1 - privateOpacity, transition: "none" }}
        >
          <SoftAurora {...AURORA_PUBLIC} />
        </div>
      </div>

      {/* ── SLIDE CURTAIN ─────────────────────────────── */}
      <div style={curtain} aria-hidden="true" />

      {/* ── PAGE CONTENT ──────────────────────────────── */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </>
  );
}

function applyThemeClass(mode: string) {
  if (mode === "PUBLIC") {
    document.documentElement.classList.add("theme-public");
    document.body.classList.add("theme-public");
  } else {
    document.documentElement.classList.remove("theme-public");
    document.body.classList.remove("theme-public");
  }
}
