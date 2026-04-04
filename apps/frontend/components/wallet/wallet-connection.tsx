"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKit } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { useState, useEffect } from "react";

interface WalletConnectionProps {
  /** Override the connect button's style (gradient, shadow, etc.) */
  buttonStyle?: React.CSSProperties;
}

export function WalletConnection({ buttonStyle }: WalletConnectionProps = {}) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (isConnected) {
    const formattedBal = balanceData
      ? (Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(3)
      : "0.000";
    const shortAddr = address
      ? `${address.slice(0, 6)}···${address.slice(-4)}`
      : "Connected";

    return (
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {shortAddr}
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: "var(--text)" }}
        >
          {formattedBal} ETH
        </p>
        <button
          onClick={() => open()}
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-mono transition-opacity hover:opacity-60"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Wallet
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="w-full h-14 rounded-[14px] text-sm font-sans font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
      style={{
        background: "linear-gradient(135deg,#7C3AED,#6366F1)",
        boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
        color: "#fff",
        ...buttonStyle,
      }}
    >
      Connect Wallet
    </button>
  );
}
