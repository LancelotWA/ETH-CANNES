"use client";

import { Suspense } from "react";
import { SendPaymentForm } from "@/components/payments/send-payment-form";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { motion } from "framer-motion";

export default function SendPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-10 md:pt-16 pb-16"
    >
      <h1 className="text-4xl md:text-[4rem] font-black text-white text-center tracking-tighter drop-shadow-2xl mt-0 mb-8">
        <DecryptedText text="SEND" animateOn="view" speed={160} sequential={true} />
      </h1>

      <div className="w-full max-w-sm mb-16">
        <WalletConnection />
      </div>

      <Suspense fallback={<p className="text-zinc-500 animate-pulse text-center">Chargement...</p>}>
        <div className="w-full max-w-2xl backdrop-blur-md bg-white/5 p-4 md:p-6 rounded-[2rem] shadow-2xl border border-white/10">
          <SendPaymentForm />
        </div>
      </Suspense>
    </motion.div>
  );
}
