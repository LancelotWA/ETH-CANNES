"use client";

import { useAccount } from "wagmi";

import { SendPaymentForm } from "@/components/payments/send-payment-form";
import { WalletConnection } from "@/components/wallet/wallet-connection";

export default function SendPage() {
  const { address } = useAccount();

  return (
    <div className="mx-auto max-w-xl">
      {!address ? (
        <WalletConnection />
      ) : (
        <SendPaymentForm senderAddress={address} />
      )}
    </div>
  );
}
