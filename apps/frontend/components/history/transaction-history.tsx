"use client";

import { useCallback, useEffect, useState } from "react";

import { getPublicHistory } from "@/lib/public/transactions";
import { shortenAddress, formatUSDC } from "@/lib/public/helpers";
import type { PublicTransferRecord, WalletAddress } from "@ethcannes/types";

interface TransactionHistoryProps {
  address: WalletAddress;
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const [txs, setTxs] = useState<PublicTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await getPublicHistory(address);
      setTxs(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Recent transactions</h2>
      <p className="mt-1 text-xs font-mono text-zinc-400">{shortenAddress(address)}</p>

      {loading && (
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && txs.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No transactions found.</p>
      )}

      {!loading && !error && txs.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-100">
          {txs.map((tx) => {
            const isSent = tx.from.toLowerCase() === address.toLowerCase();
            return (
              <li key={tx.txHash} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-800">
                    {isSent ? (
                      <>
                        <span className="text-red-600">Sent</span> to{" "}
                        <span className="font-mono text-xs">{shortenAddress(tx.to)}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-600">Received</span> from{" "}
                        <span className="font-mono text-xs">{shortenAddress(tx.from)}</span>
                      </>
                    )}
                  </p>
                  {tx.note && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{tx.note}</p>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    isSent ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {isSent ? "-" : "+"}{formatUSDC(tx.amount)} USDC
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
