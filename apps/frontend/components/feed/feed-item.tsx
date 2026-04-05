"use client";

import { useState } from "react";
import type { FeedItem } from "@ethcannes/types";

interface FeedItemCardProps {
  item: FeedItem;
}

const QUICK_REACTIONS = ["❤️", "🎉", "🔥", "👏", "😂"];

export function FeedItemCard({ item }: FeedItemCardProps) {
  const timeAgo = formatTimeAgo(new Date(item.createdAt));

  return (
    <article className="group flex flex-row items-center justify-between border-0 border-b-2 border-white/10 py-5 transition-colors hover:bg-white/5 px-2">
      <div className="flex flex-col">
        <p className="text-2xl font-black text-white">{Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.tokenSymbol ?? "USDC"}</p>
        <div className="text-sm text-white/50 mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
          <span className="text-[#10b981]">PUBLIC</span>
          <span className="text-white shrink-0">{item.sender.displayName}</span>
          <span className="opacity-50">→</span>
          <span className="text-white shrink-0">{item.recipient.displayName}</span>
        </div>
        {item.note && (
          <p className="text-sm text-white/30 mt-1 uppercase font-bold tracking-wider">&ldquo;{item.note}&rdquo;</p>
        )}
      </div>

      <div className="text-right flex flex-col items-end">
        <p className="text-sm font-bold uppercase tracking-wider text-white/30 mb-2">{timeAgo}</p>
        <div className="flex flex-wrap items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity justify-end">
          {item.reactions.map((r) => (
            <span key={r.id} className="text-2xl">{r.emoji}</span>
          ))}
          {QUICK_REACTIONS.map((emoji) => (
            <button key={emoji} className="text-2xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-125 transition-all">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
