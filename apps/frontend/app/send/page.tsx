"use client";

import { Suspense } from "react";
import { SendPaymentForm } from "@/components/payments/send-payment-form";

export default function SendPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Send</h1>
      <Suspense fallback={<p className="text-zinc-500 animate-pulse">Chargement...</p>}>
        <div className="mx-auto max-w-xl">
          <SendPaymentForm senderUserId="de305d54-75b4-431b-adb2-eb6b9e546014" />
        </div>
      </Suspense>
    </div>
  );
}
