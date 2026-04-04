"use client";

import { useEffect, useState } from "react";

import { getJson } from "@/lib/api";
import type { FeedItem } from "@ethcannes/types";
import { FeedItemCard } from "./feed-item";

export function FeedList() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<FeedItem[]>("/feed")
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

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
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
