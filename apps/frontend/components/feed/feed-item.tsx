"use client";

import type { FeedItem } from "@ethcannes/types";

interface FeedItemCardProps {
  item: FeedItem;
}

const QUICK_REACTIONS = ["❤️", "🎉", "🔥", "👏", "😂"];

export function FeedItemCard({ item }: FeedItemCardProps) {
  const timeAgo = formatTimeAgo(new Date(item.createdAt));

  return (
    <article className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {(item.sender.displayName?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-800">
            <span className="font-semibold">{item.sender.ensName ?? item.sender.displayName}</span>
            {" paid "}
            <span className="font-semibold">{item.recipient.ensName ?? item.recipient.displayName}</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{timeAgo}</p>
          {item.note && (
            <p className="mt-1 rounded-xl bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700">{item.note}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-zinc-900">
            {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-zinc-500">{item.tokenSymbol ?? "USDC"}</p>
        </div>
      </div>

      {/* Reactions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {item.reactions.map((r) => (
          <span
            key={r.id}
            className="rounded-full border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-sm"
          >
            {r.emoji}
          </span>
        ))}
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className="rounded-full border border-zinc-100 bg-white px-2 py-0.5 text-sm opacity-50 transition-opacity hover:opacity-100"
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
