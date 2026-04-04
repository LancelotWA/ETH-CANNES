"use client";

import { AppProviders } from "@/components/providers/app-providers";
import { PaymentLinkGenerator } from "@/components/payments/payment-link-generator";
import { QrCodeDisplay } from "@/components/qr/qr-code-display";
import { useAppStore } from "@/store/useAppStore";

export default function RequestPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <AppProviders>
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold">Request money</h1>
        <PaymentLinkGenerator ownerId={activeUserId} />
        <QrCodeDisplay ownerId={activeUserId} />
      </div>
    </AppProviders>
  );
}
