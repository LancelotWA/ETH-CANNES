"use client";

import { useAccount, useDisconnect, useBalance, useConnect } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { projectId } from "@/lib/wagmi";
import { useState, useEffect } from "react";

interface WalletConnectionProps {
  /** Override the connect button's style (gradient, shadow, etc.) */
  buttonStyle?: React.CSSProperties;
}

export function WalletConnection({ buttonStyle }: WalletConnectionProps = {}) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, isPending } = useConnect();
  const { data: balanceData } = useBalance({ address });

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
          onClick={() => disconnect()}
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-mono transition-opacity hover:opacity-60"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  const handleConnect = () => {
    connect({ connector: walletConnect({ projectId, showQrModal: true }) });
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="w-full h-14 rounded-[14px] text-sm font-sans font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      style={{
        background: isPending
          ? "var(--surface)"
          : "linear-gradient(135deg,#7C3AED,#6366F1)",
        boxShadow: isPending
          ? "none"
          : "0 8px 24px rgba(124,58,237,0.4)",
        color: isPending ? "var(--text-muted)" : "#fff",
        ...(!isPending ? buttonStyle : {}),
      }}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
