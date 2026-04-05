"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";

interface BaseScanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  functionName: string;
}

interface DisplayTx {
  hash: string;
  from: string;
  to: string;
  amount: string;
  date: string;
  direction: "in" | "out" | "self";
}

interface TransactionHistoryProps {
  userId: string;
  compact?: boolean;
}

const BASESCAN_API = "https://api-sepolia.basescan.org/api";

function formatAddr(addr: string | undefined): string | null {
  if (!addr || addr === "0x" || addr.length < 10) return null;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAmount(weiStr: string): string {
  const val = Number(weiStr) / 1e18;
  if (val === 0) return "0";
  if (val < 0.0001) return "<0.0001";
  return val.toFixed(4);
}

function formatDate(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransactionHistory({ userId, compact = false }: TransactionHistoryProps) {
  const [items, setItems] = useState<DisplayTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const addr = userId.toLowerCase();

    fetch(
      `${BASESCAN_API}?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=${compact ? 5 : 25}&sort=desc`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "1" || !Array.isArray(data.result)) {
          setItems([]);
          return;
        }

        const txs: DisplayTx[] = (data.result as BaseScanTx[])
          .filter((tx) => tx.isError === "0")
          .map((tx) => {
            const from = tx.from.toLowerCase();
            const to = tx.to?.toLowerCase() ?? "";
            const direction: "in" | "out" | "self" =
              from === addr && to === addr
                ? "self"
                : from === addr
                  ? "out"
                  : "in";

            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: formatAmount(tx.value),
              date: formatDate(tx.timeStamp),
              direction,
            };
          });

        setItems(txs);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId, compact]);

  if (loading) {
    return (
      <p
        className="text-xs font-mono animate-pulse px-4 py-5"
        style={{ color: "var(--text-subtle)" }}
      >
        Loading...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p
        className="text-xs font-mono px-4 py-5"
        style={{ color: "var(--text-subtle)" }}
      >
        No transactions yet
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((tx, i) => {
        const isLast = i === items.length - 1;
        const prefix = tx.direction === "in" ? "+" : tx.direction === "out" ? "-" : "";
        const color =
          tx.direction === "in"
            ? "#10B981"
            : tx.direction === "out"
              ? "#EF4444"
              : "var(--text-muted)";

        const counterpart = tx.direction === "in" ? tx.from : tx.to;
        const counterpartDisplay = formatAddr(counterpart);

        return (
          <li
            key={tx.hash}
            className="flex items-center justify-between px-4 py-3"
            style={
              !isLast
                ? { borderBottom: "1px solid var(--border)" }
                : undefined
            }
          >
            {/* Left: amount + date */}
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold font-mono" style={{ color }}>
                {prefix}{tx.amount} ETH
              </p>
              <p className="text-[10px] font-sans" style={{ color: "var(--text-subtle)" }}>
                {tx.date}
              </p>
            </div>

            {/* Right: counterpart address */}
            <div className="text-right">
              {counterpartDisplay ? (
                <p className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {counterpartDisplay}
                </p>
              ) : (
                <HelpCircle size={14} style={{ color: "var(--text-subtle)" }} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
