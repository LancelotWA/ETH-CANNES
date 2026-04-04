"use client";

import { Suspense } from "react";
import { PaymentLinkGenerator } from "@/components/payments/payment-link-generator";
import { QrCodeDisplay } from "@/components/qr/qr-code-display";
import { useAppStore } from "@/store/useAppStore";

export default function RequestPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Request</h1>
      <Suspense fallback={<p className="text-zinc-500 animate-pulse">Chargement...</p>}>
        <div className="mx-auto max-w-xl space-y-6">
          <PaymentLinkGenerator ownerId={activeUserId} />
          <QrCodeDisplay ownerId={activeUserId} />
        </div>
      </Suspense>
    </div>
  );
}
