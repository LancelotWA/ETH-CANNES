"use client";

import { useEffect, useState } from "react";

import { getJson } from "@/lib/api";
import type { TransactionRecord } from "@ethcannes/types";

export function TransactionHistory({ userId }: { userId: string }) {
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const txs = await getJson<TransactionRecord[]>(`/transactions/user/${userId}`);
        setItems(txs);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Recent transactions</h2>
      {loading ? <p className="mt-2 text-sm text-zinc-500">Loading...</p> : null}
      {!loading && items.length === 0 ? <p className="mt-2 text-sm text-zinc-500">No transactions yet.</p> : null}
      <ul className="mt-4 space-y-2">
        {items.map((tx) => (
          <li key={tx.id} className="rounded-xl border border-zinc-100 p-3 text-sm">
            <p className="font-medium">{tx.amount} {tx.tokenSymbol}</p>
            <p className="text-zinc-500">Status: {tx.status}</p>
            <p className="text-zinc-500">{tx.note ?? "No note"}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
