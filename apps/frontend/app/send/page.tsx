"use client";

import { AppProviders } from "@/components/providers/app-providers";
import { SendPaymentForm } from "@/components/payments/send-payment-form";

export default function SendPage() {
  return (
    <AppProviders>
      <div className="mx-auto max-w-xl">
        <SendPaymentForm senderUserId="de305d54-75b4-431b-adb2-eb6b9e546014" />
      </div>
    </AppProviders>
  );
}
