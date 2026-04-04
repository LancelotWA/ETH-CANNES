"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
import type { TransactionRecord } from "@ethcannes/types";
import { DecryptedText } from "@/components/ui/decrypted-text";

interface TransactionHistoryProps {
  userId: string;
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<TransactionRecord[]>(`/transactions/user/${userId}`)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section className="w-full">
      {loading ? <p className="text-sm font-bold tracking-widest text-white/30 uppercase animate-pulse">LOADING...</p> : null}
      {!loading && items.length === 0 ? <p className="text-sm font-bold tracking-widest text-white/30 uppercase">NO TRANSACTIONS YET</p> : null}

      <ul className="flex flex-col w-full">
        {items.map((tx) => {
          const isPublic = tx.mode === "PUBLIC";
          return (
            <li key={tx.id} className="flex flex-row items-center justify-between border-0 border-b-2 border-white/10 py-5 transition-colors hover:bg-white/5 px-2">
              <div className="flex flex-col">
                <p className="text-2xl font-black text-white">{tx.amount} {tx.tokenSymbol}</p>
                <div className="text-sm text-white/50 mt-1 uppercase font-bold tracking-widest flex flex-wrap items-center gap-2">
                  {!isPublic ? (
                    <>
                      <span className="text-[#8b5cf6]">PRIVATE</span>
                      <DecryptedText
                        text={tx.note ?? "TRANSFER"}
                        animateOn="view"
                        speed={150}
                        sequential={true}
                        className="font-mono text-white/70"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-[#10b981]">PUBLIC</span>
                      <span className="text-white/70">{tx.note ?? "TRANSFER"}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold uppercase tracking-wider text-white/50">{tx.status}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
