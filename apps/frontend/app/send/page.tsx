"use client";

import { Suspense } from "react";
import { SendPaymentForm } from "@/components/payments/send-payment-form";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { motion } from "framer-motion";

export default function SendPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 pb-28 px-4 max-w-md mx-auto"
    >
      <div
        className="w-full rounded-[24px] p-5 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.005)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          className="text-2xl font-bold tracking-tight text-center"
          style={{ color: "var(--text)" }}
        >
          <DecryptedText text="SEND" animateOn="view" speed={160} sequential />
        </h1>

        <Suspense
          fallback={
            <p className="text-sm animate-pulse text-center" style={{ color: "var(--text-muted)" }}>
              Loading...
            </p>
          }
        >
          <SendPaymentForm />
        </Suspense>
      </div>
    </motion.div>
  );
}
