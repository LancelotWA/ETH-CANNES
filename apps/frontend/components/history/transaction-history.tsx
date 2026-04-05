"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import type { TransactionRecord } from "@ethcannes/types";
import { ArrowUpRight, ArrowDownLeft, Lock } from "lucide-react";

interface TransactionHistoryProps {
  userId: string;
  /** Show only the 5 most recent items with no outer padding */
  compact?: boolean;
}

export function TransactionHistory({ userId, compact = false }: TransactionHistoryProps) {
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const isPrivate = globalPaymentMode === "PRIVATE";

  useEffect(() => {
    getJson<TransactionRecord[]>(`/transactions/user/${userId}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const displayed = compact ? items.slice(0, 5) : items;

  if (loading) {
    return (
      <p
        className="text-xs font-mono animate-pulse px-4 py-5"
        style={{ color: "var(--text-subtle)" }}
      >
        Loading…
      </p>
    );
  }

  if (displayed.length === 0) {
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
      {displayed.map((tx, i) => {
        const isPrivateTx = tx.mode === "PRIVATE";
        const isLast = i === displayed.length - 1;

        // Determine sent vs received (heuristic: status SENT = outgoing)
        const isSent = tx.status?.toUpperCase() === "SENT" || tx.status?.toUpperCase() === "COMPLETED";

        // In private mode, anonymize private tx counterpart
        const label =
          isPrivateTx && isPrivate
            ? "••••••••"
            : tx.note ?? (isPrivateTx ? "Private transfer" : "Transfer");

        return (
          <li
            key={tx.id}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-hover)]"
            style={
              !isLast
                ? { borderBottom: "1px solid var(--border)" }
                : undefined
            }
          >
            {/* Direction icon */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={
                isPrivateTx
                  ? { background: "rgba(124,58,237,0.12)" }
                  : { background: "rgba(37,99,235,0.08)" }
              }
            >
              {isPrivateTx ? (
                <Lock
                  size={14}
                  style={{ color: isPrivate ? "#A78BFA" : "#7C3AED" }}
                />
              ) : isSent ? (
                <ArrowUpRight
                  size={14}
                  style={{ color: "var(--text-muted)" }}
                />
              ) : (
                <ArrowDownLeft
                  size={14}
                  style={{ color: "#10B981" }}
                />
              )}
            </div>

            {/* Label + status */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-mono truncate"
                style={{ color: "var(--text)" }}
              >
                {label}
              </p>
              <p
                className="text-[11px] font-mono mt-0.5 flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                {isPrivateTx ? (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      color: "#A78BFA",
                    }}
                  >
                    PRIVATE
                  </span>
                ) : (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest"
                    style={{
                      background: "rgba(37,99,235,0.08)",
                      color: "var(--accent)",
                    }}
                  >
                    PUBLIC
                  </span>
                )}
                {tx.status}
              </p>
            </div>

            {/* Amount */}
            <p
              className="text-sm font-mono font-semibold flex-shrink-0"
              style={{
                color: isPrivateTx && isPrivate ? "#A78BFA" : "var(--text)",
                filter: isPrivateTx && isPrivate ? "none" : "none",
              }}
            >
              {tx.amount} {tx.tokenSymbol}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
