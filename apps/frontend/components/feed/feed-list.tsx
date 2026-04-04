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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl glass-card bg-surface/50" />
        ))}
      </div>
    );
  }

  const feedItems = items ?? [];

  if (feedItems.length === 0) {
    return (
      <div className="glass-card rounded-2xl border-dashed py-16 text-center">
        <p className="text-sm text-text font-medium mb-1">No public transactions yet.</p>
        <p className="text-xs text-text-muted">Send a public payment to see it here!</p>
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
