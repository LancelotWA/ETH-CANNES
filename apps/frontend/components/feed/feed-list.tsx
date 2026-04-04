"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { getPublicHistory } from "@/lib/public/transactions";
import { batchLookup } from "@/lib/public/ens";
import type { PublicTransferRecord, WalletAddress } from "@ethcannes/types";
import { FeedItemCard } from "./feed-item";

export interface EnrichedFeedItem extends PublicTransferRecord {
  fromEns: string | null;
  toEns: string | null;
}

export function FeedList() {
  const { address } = useAccount();
  const [items, setItems] = useState<EnrichedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      // Use connected wallet address, or fetch a global feed from a known address
      const target = address ?? ("0x0000000000000000000000000000000000000000" as WalletAddress);
      const history = await getPublicHistory(target);

      // Batch-resolve ENS names
      const allAddresses = [
        ...new Set(history.flatMap((t) => [t.from, t.to])),
      ] as WalletAddress[];
      const ensMap = await batchLookup(allAddresses);

      const enriched: EnrichedFeedItem[] = history.map((t) => ({
        ...t,
        fromEns: ensMap.get(t.from) ?? null,
        toEns: ensMap.get(t.to) ?? null,
      }));

      setItems(enriched);
    } catch {
      // Feed fetch failed — show empty state
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
        <p className="text-sm text-zinc-400">No public transactions yet.</p>
        <p className="mt-1 text-xs text-zinc-300">Send a public payment to see it here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeedItemCard key={item.txHash} item={item} />
      ))}
    </div>
  );
}
