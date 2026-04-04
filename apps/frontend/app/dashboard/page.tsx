"use client";

import { AppProviders } from "@/components/providers/app-providers";
import { TransactionHistory } from "@/components/history/transaction-history";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <AppProviders>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <WalletConnection />
        <TransactionHistory userId={activeUserId} />
      </div>
    </AppProviders>
  );
}
