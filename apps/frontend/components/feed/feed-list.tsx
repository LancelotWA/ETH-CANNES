"use client";

import { useApiQuery } from "@/hooks/useApi";
import type { FeedItem } from "@ethcannes/types";
import { FeedItemCard } from "./feed-item";

export function FeedList() {
  const { data: items, isLoading } = useApiQuery<FeedItem[]>("/feed", {
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse border-b-2 border-white/10 bg-transparent" />
        ))}
      </div>
    );
  }

  const feedItems = items ?? [];

  if (feedItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-bold tracking-widest text-white/30 uppercase">NO PUBLIC TRANSACTIONS YET</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
