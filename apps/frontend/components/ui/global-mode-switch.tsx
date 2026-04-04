"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MnemonicModal } from "@/components/ui/mnemonic-modal";

export function GlobalModeSwitch() {
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const togglePaymentMode = useAppStore((s) => s.togglePaymentMode);
  const adminBypass = useAppStore((s) => s.adminBypass);
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!isConnected && !adminBypass) return null;

  const isPublic = globalPaymentMode === "PUBLIC";

  const handleToggle = () => {
    if (isPublic) {
      // PUBLIC → PRIVATE: ask for mnemonic first
      setShowMnemonic(true);
    } else {
      // PRIVATE → PUBLIC: switch directly
      togglePaymentMode();
    }
  };

  const handleMnemonicConfirm = (mnemonic: string) => {
    console.info("[Unlink] mnemonic captured, length:", mnemonic.split(" ").length);
    // TODO: send mnemonic to backend /unilink/account
    setShowMnemonic(false);
    togglePaymentMode();
  };

  return (
    <>
      <div className="fixed top-4 left-4 md:top-5 md:left-5 z-50">
        <button
          onClick={handleToggle}
          aria-label={`Switch to ${isPublic ? "private" : "public"} mode`}
          style={{ minWidth: 148 }}
          className="
            relative flex items-center h-9 rounded-full p-1
            border border-[var(--border)]
            bg-[var(--surface)]
            shadow-sm
            transition-shadow duration-300
            hover:shadow-[0_0_16px_var(--accent-glow)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
          "
        >
          {/* Sliding active pill */}
          <span
            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: "calc(50% - 4px)",
              left: isPublic ? "calc(50% + 2px)" : "4px",
              background: isPublic
                ? "linear-gradient(135deg,#2563EB,#3B82F6)"
                : "linear-gradient(135deg,#7C3AED,#6366F1)",
              boxShadow: isPublic
                ? "0 0 12px rgba(37,99,235,0.45)"
                : "0 0 12px rgba(124,58,237,0.45)",
            }}
          />

          <span
            className="relative z-10 flex-1 text-center text-[11px] font-mono font-semibold tracking-wide transition-colors duration-300 select-none"
            style={{ color: !isPublic ? "#fff" : "var(--text-muted)" }}
          >
            PRIVATE
          </span>

          <span
            className="relative z-10 flex-1 text-center text-[11px] font-mono font-semibold tracking-wide transition-colors duration-300 select-none"
            style={{ color: isPublic ? "#fff" : "var(--text-muted)" }}
          >
            PUBLIC
          </span>
        </button>
      </div>

      {showMnemonic && (
        <MnemonicModal
          onConfirm={handleMnemonicConfirm}
          onCancel={() => setShowMnemonic(false)}
        />
      )}
    </>
  );
}
