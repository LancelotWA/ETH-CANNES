"use client";

import { Suspense, useState } from "react";
import { FeedList } from "@/components/feed/feed-list";
import { TransactionHistory } from "@/components/history/transaction-history";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function FeedPage() {
  const [tab, setTab] = useState<"HISTORY" | "PUBLIC">("HISTORY");
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 md:pt-6 pb-24"
    >
      <h1 className="text-4xl md:text-[3.5rem] font-black text-white text-center tracking-tighter drop-shadow-2xl mt-0 mb-4">
        <DecryptedText text="HISTORY" animateOn="view" speed={100} sequential={true} />
      </h1>

      <div className="flex gap-8 w-full max-w-md mb-2 px-4">
        <button
          onClick={() => setTab("HISTORY")}
          className={`flex-1 pb-2 border-b-4 font-black tracking-widest text-lg md:text-xl uppercase transition-all duration-300 ${tab === "HISTORY" ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
        >
          My History
        </button>
        <button
          onClick={() => setTab("PUBLIC")}
          className={`flex-1 pb-2 border-b-4 font-black tracking-widest text-lg md:text-xl uppercase transition-all duration-300 ${tab === "PUBLIC" ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
        >
          Public Feed
        </button>
      </div>

      <Suspense fallback={<p className="text-zinc-500 animate-pulse text-center">Chargement...</p>}>
        <div className="w-full max-w-md backdrop-blur-md bg-surface/10 p-4 md:p-6 rounded-[2rem] border border-white/5">
          {tab === "PUBLIC" ? <FeedList /> : <TransactionHistory userId={activeUserId} />}
        </div>
      </Suspense>
    </motion.div>
  );
}
