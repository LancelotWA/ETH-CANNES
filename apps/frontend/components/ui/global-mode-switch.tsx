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
      <label className="relative inline-block w-[100px] h-[40px]">
        <input 
          type="checkbox" 
          className="opacity-0 w-0 h-0 peer"
          checked={isPublic}
          onChange={togglePaymentMode}
        />
        <span 
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-400 rounded-[34px] ${
            isPublic ? "bg-[#323E52]" : "bg-[#ffecb3]"
          }`}
        ></span>
        <span 
          className={`absolute flex justify-center items-center h-[40px] w-[40px] rounded-full transition-all duration-400 text-[25px] bg-transparent pointer-events-none ${
            isPublic ? "translate-x-[60px]" : "translate-x-0"
          }`}
        >
          {isPublic ? "👁️" : "🕶️"}
        </span>
      </label>
    </div>
  );
}
