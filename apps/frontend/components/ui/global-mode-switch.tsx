"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";

export function GlobalModeSwitch() {
  const globalPaymentMode = useAppStore((state) => state.globalPaymentMode);
  const togglePaymentMode = useAppStore((state) => state.togglePaymentMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isPublic = globalPaymentMode === "PUBLIC";

  return (
    <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
      <label className="relative inline-block w-[90px] h-[44px] cursor-pointer group">
        <input 
          type="checkbox" 
          className="opacity-0 w-0 h-0 peer"
          checked={isPublic}
          onChange={togglePaymentMode}
        />
        {/* Track */}
        <span 
          className={`absolute top-0 left-0 right-0 bottom-0 transition-colors duration-500 rounded-full shadow-inner ${
            isPublic ? "bg-[#ffe082]" : "bg-[#2A3441]"
          } border border-white/10`}
        ></span>
        
        {/* Bulle / Boule rotative */}
        <span 
          className={`absolute flex justify-center items-center h-[36px] w-[36px] rounded-full transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-[#ffffff] top-[4px] pointer-events-none ${
            isPublic ? "translate-x-[50px] rotate-[360deg] bg-[#ffffff]" : "translate-x-[4px] rotate-0 bg-[#ffffff]"
          }`}
        >
          {isPublic ? (
             <img src="/2115194.png" alt="Public Eye" className="w-[20px] h-[20px] object-contain opacity-80" />
          ) : (
             <img src="/16684419.png" alt="Private Mode" className="w-[20px] h-[20px] object-contain opacity-80" />
          )}
        </span>
      </label>
    </div>
  );
}
