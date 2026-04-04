"use client";

import { useAccount, useDisconnect, useBalance, useConnect } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { projectId } from "@/lib/wagmi";
import { useState, useEffect } from "react";

export function WalletConnection() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, isPending } = useConnect();

  const { data: balanceData } = useBalance({ address });

  useEffect(() => {
    setMounted(true);
  }, []);

  const ethPrice = 3500;

  if (!mounted) return null;

  if (isConnected) {
    const formattedBal = balanceData ? Number(balanceData.formatted).toFixed(3) : "0.000";
    const usdVal = balanceData ? (Number(balanceData.formatted) * ethPrice).toFixed(2) : "0.00";
    return (
      <div className="flex flex-col items-center gap-0 mt-2">
        <p className="text-xs font-bold text-white/30 tracking-widest uppercase mb-1">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "CONNECTED"}
        </p>
        <h2 className="text-3xl font-black text-white metallic-text">
          {formattedBal} ETH
        </h2>
        <p className="text-lg font-bold text-white/50 uppercase tracking-widest">
          (${usdVal} USD)
        </p>
        <button
          className="mt-4 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-black text-white/50 transition-all hover:bg-white/10 hover:text-white"
          onClick={() => disconnect()}
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  const handleConnect = () => {
    connect({
      connector: walletConnect({ projectId, showQrModal: true }),
    });
  };

  return (
    <div className="mt-2 text-center">
      <button
        onClick={handleConnect}
        disabled={isPending}
        className={`rounded-[2rem] px-6 py-3 font-black uppercase text-base shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95 ${
          isPending ? "bg-white/20 text-white/50 cursor-not-allowed" : "bg-white text-black"
        }`}
      >
        {isPending ? "CONNECTING..." : "CONNECT WALLET"}
      </button>
    </div>
  );
}
