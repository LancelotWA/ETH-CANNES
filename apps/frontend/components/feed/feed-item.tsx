"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { sendReaction } from "@/lib/public/reactions";
import { shortenAddress, formatUSDC } from "@/lib/public/helpers";
import type { WalletAddress, HexHash } from "@ethcannes/types";
import type { EnrichedFeedItem } from "./feed-list";

interface FeedItemCardProps {
  item: EnrichedFeedItem;
}

const QUICK_REACTIONS = ["❤️", "🎉", "🔥", "👏", "😂"];

export function FeedItemCard({ item }: FeedItemCardProps) {
  const { address } = useAccount();
  const [reacting, setReacting] = useState<string | null>(null);
  const [reactedEmojis, setReactedEmojis] = useState<string[]>([]);

  const senderLabel = item.fromEns ?? shortenAddress(item.from);
  const recipientLabel = item.toEns ?? shortenAddress(item.to);
  const timeAgo = formatTimeAgo(new Date(item.timestamp));

  async function handleReaction(emoji: string) {
    if (!address || reacting) return;

    setReacting(emoji);
    try {
      await sendReaction({
        to: item.from as WalletAddress,
        emoji,
        targetTxHash: item.txHash as HexHash,
      });
      setReactedEmojis((prev) => [...prev, emoji]);
    } catch {
      // Reaction tx failed — user likely rejected
    } finally {
      setReacting(null);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
          {senderLabel[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-800">
            <span className="font-semibold">{senderLabel}</span>
            {" → "}
            <span className="font-semibold">{recipientLabel}</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{timeAgo}</p>
          {item.note && (
            <p className="mt-1 rounded-xl bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700">
              {item.note}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-zinc-900">
            {formatUSDC(item.amount)}
          </p>
          <p className="text-xs text-zinc-500">USDC</p>
        </div>
      </div>

      {/* Reactions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {reactedEmojis.map((emoji, i) => (
          <span
            key={`${emoji}-${i}`}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-sm"
          >
            {emoji}
          </span>
        ))}
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={reacting !== null || !address}
            className={`rounded-full border border-zinc-100 bg-white px-2 py-0.5 text-sm transition-opacity ${
              reacting === emoji
                ? "animate-pulse opacity-100"
                : "opacity-50 hover:opacity-100"
            } disabled:cursor-not-allowed`}
            title={
              !address
                ? "Connect wallet to react"
                : `React with ${emoji} (0.01 USDC)`
            }
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
