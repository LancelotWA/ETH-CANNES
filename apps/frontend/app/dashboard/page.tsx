"use client";

import { useAccount } from "wagmi";

import { TransactionHistory } from "@/components/history/transaction-history";
import { WalletConnection } from "@/components/wallet/wallet-connection";

export default function DashboardPage() {
  const { address } = useAccount();

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <WalletConnection />
      {address && <TransactionHistory address={address} />}
    </div>
  );
}
