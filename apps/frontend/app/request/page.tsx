"use client";

import { useAccount } from "wagmi";

import { PaymentLinkGenerator } from "@/components/payments/payment-link-generator";
import { QrCodeDisplay } from "@/components/qr/qr-code-display";

export default function RequestPage() {
  const { address } = useAccount();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Request money</h1>
      {address && (
        <>
          <PaymentLinkGenerator address={address} />
          <QrCodeDisplay address={address} />
        </>
      )}
    </div>
  );
}
