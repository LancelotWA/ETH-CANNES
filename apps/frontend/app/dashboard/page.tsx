"use client";

import { Suspense } from "react";
import { TransactionHistory } from "@/components/history/transaction-history";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Suspense fallback={<p className="text-zinc-500 animate-pulse">Chargement...</p>}>
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <WalletConnection />
          <TransactionHistory userId={activeUserId} />
        </div>
      </Suspense>
    </div>
  );
}
