"use client";

import type { FeedItem } from "@ethcannes/types";

interface FeedItemCardProps {
  item: FeedItem;
}

const QUICK_REACTIONS = ["❤️", "🎉", "🔥", "👏", "😂"];

export function FeedItemCard({ item }: FeedItemCardProps) {
  const timeAgo = formatTimeAgo(new Date(item.createdAt));

  return (
    <article className="glass-card rounded-2xl p-5 group transition-transform hover:scale-[1.01]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-public/20 border border-public/30 text-public font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          {(item.sender.displayName?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-muted">
            <span className="font-bold text-white">{item.sender.ensName ?? item.sender.displayName}</span>
            {" paid "}
            <span className="font-bold text-white">{item.recipient.ensName ?? item.recipient.displayName}</span>
          </p>
          <p className="mt-1 text-xs text-text-muted/60">{timeAgo}</p>
          {item.note && (
            <p className="mt-2 inline-block rounded-xl bg-surface border border-border px-3 py-1.5 text-sm text-text/90 italic">{item.note}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-public drop-shadow-sm">
            {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{item.tokenSymbol ?? "USDC"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
        {item.reactions.map((r) => (
          <span
            key={r.id}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-sm shadow-sm"
          >
            {r.emoji}
          </span>
        ))}
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className="rounded-full border border-border bg-transparent px-2.5 py-1 text-sm opacity-50 transition-all hover:opacity-100 hover:scale-110 hover:bg-surface"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
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
