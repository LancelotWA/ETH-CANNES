"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import LightRays from "@/components/ui/light-rays";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const globalPaymentMode = useAppStore((state) => state.globalPaymentMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Add transitioning class for the blur effect
    setIsTransitioning(true);
    
    if (globalPaymentMode === "PUBLIC") {
      document.documentElement.classList.add("theme-public");
      document.body.classList.add("theme-public");
    } else {
      document.documentElement.classList.remove("theme-public");
      document.body.classList.remove("theme-public");
    }

    const timeout = setTimeout(() => setIsTransitioning(false), 800);
    return () => clearTimeout(timeout);
  }, [globalPaymentMode, mounted]);

  const rayColor = globalPaymentMode === "PUBLIC" ? "#fbbf24" : "#8b5cf6"; // Yellow vs Purple

  return (
    <>
      <LightRays raysColor={rayColor} raysSpeed={0.5} pulsating={false} />
      <div 
        className={`transition-all duration-700 w-full h-full ${
          isTransitioning ? "blur-xl scale-105 opacity-80" : "blur-0 scale-100 opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
