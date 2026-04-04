"use client";

import { Suspense } from "react";
import { ContactsList } from "@/components/contacts/contacts-list";
import { useAppStore } from "@/store/useAppStore";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { motion } from "framer-motion";

export default function ContactsPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-10 md:pt-16 pb-16"
    >
      <h1 className="text-4xl md:text-[4rem] font-black text-white text-center tracking-tighter drop-shadow-2xl mt-0 mb-8">
        <DecryptedText text="CONTACTS" animateOn="view" speed={100} sequential={true} />
      </h1>

      <Suspense fallback={<p className="text-zinc-500 animate-pulse text-center">Chargement...</p>}>
        <div className="w-full max-w-2xl backdrop-blur-md bg-surface/10 p-6 md:p-8 rounded-[2.5rem]">
          <ContactsList userId={activeUserId} />
        </div>
      </Suspense>
    </motion.div>
  );
}
