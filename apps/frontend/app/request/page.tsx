"use client";

import { Suspense } from "react";
import { PaymentLinkGenerator } from "@/components/payments/payment-link-generator";
import { QrCodeDisplay } from "@/components/qr/qr-code-display";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { useAppStore } from "@/store/useAppStore";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { motion } from "framer-motion";

export default function RequestPage() {
  const activeUserId = useAppStore((state) => state.activeUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 md:pt-6 pb-24"
    >
      <h1 className="text-4xl md:text-[3.5rem] font-black text-white text-center tracking-tighter drop-shadow-2xl mt-0 mb-4">
        <DecryptedText text="REQUEST" animateOn="view" speed={100} sequential={true} />
      </h1>

      <div className="w-full max-w-sm mb-6">
        <WalletConnection />
      </div>

      <Suspense fallback={<p className="text-zinc-500 animate-pulse text-center">Chargement...</p>}>
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 items-stretch justify-center">
          <div className="flex-1 backdrop-blur-md bg-surface/10 p-4 md:p-6 rounded-[2rem]">
            <PaymentLinkGenerator ownerId={activeUserId} />
          </div>
          <div className="flex-1 backdrop-blur-md bg-surface/10 p-4 md:p-6 rounded-[2rem]">
            <QrCodeDisplay ownerId={activeUserId} />
          </div>
        </div>
      </Suspense>
    </motion.div>
  );
}
