"use client";

import { Suspense } from "react";
import { TransactionHistory } from "@/components/history/transaction-history";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { useAppStore } from "@/store/useAppStore";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { TransitionLink } from "@/components/ui/transition-link";

export default function DashboardPage() {
  const activeUserId = useAppStore((state) => state.activeUserId);

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col justify-between items-center py-8 px-4 relative z-10">

      {/* Top */}
      <div className="w-full flex flex-col items-center gap-6 mt-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-2xl">
          <DecryptedText text="ICEBERG" animateOn="view" speed={160} sequential={true} className="metallic-text" />
        </h1>
        <WalletConnection />
      </div>

      {/* Middle Center */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl flex-1 items-center justify-center">
        <TransitionLink href="/send" className="w-full sm:w-1/2 aspect-square max-h-[200px] rounded-[3rem] bg-white text-black flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.4)] relative group overflow-hidden">
          <span className="text-4xl font-black uppercase relative z-10 group-hover:scale-110 transition-transform">Send</span>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </TransitionLink>
        <TransitionLink href="/request" className="w-full sm:w-1/2 aspect-square max-h-[200px] rounded-[3rem] bg-black/60 border border-white/20 text-white backdrop-blur-xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 relative group overflow-hidden">
          <span className="text-4xl font-black uppercase relative z-10 group-hover:scale-110 transition-transform">Request</span>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </TransitionLink>
      </div>

      {activeUserId && (
        <Suspense fallback={null}>
          <TransactionHistory userId={activeUserId} />
        </Suspense>
      )}
    </div>
  );
}
