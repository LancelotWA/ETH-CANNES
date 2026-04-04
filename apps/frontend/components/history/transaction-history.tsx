"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
import type { TransactionRecord } from "@ethcannes/types";

export function TransactionHistory({ userId }: { userId: string }) {
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<TransactionRecord[]>(`/transactions/user/${userId}`)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="text-lg font-bold text-white tracking-tight border-b border-border pb-3 mb-4">Recent transactions</h2>
      {loading ? <p className="text-sm text-text-muted animate-pulse">Loading...</p> : null}
      {!loading && items.length === 0 ? <p className="text-sm text-text-muted">No transactions yet.</p> : null}
      
      <ul className="space-y-3">
        {items.map((tx) => {
          const isPublic = tx.mode === "PUBLIC";
          return (
            <li key={tx.id} className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-surface p-3 transition-colors hover:bg-surface-hover">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isPublic ? "bg-public shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-private shadow-[0_0_8px_rgba(139,92,246,0.5)]"}`}></span>
                  <p className="font-semibold text-white">{tx.amount} {tx.tokenSymbol}</p>
                </div>
                <p className="text-xs text-text-muted mt-1 ml-4">{tx.note ?? (isPublic ? "Public transfer" : "Private transfer")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">{tx.status}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
