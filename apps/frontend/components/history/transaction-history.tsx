"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
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
        const isSent = tx.senderUserId === userId;

        // Counterpart info (only for public transactions)
        const counterpart = isSent ? tx.recipient : tx.sender;
        const counterpartName = counterpart?.displayName ?? null;

        // Amount display
        const amountPrefix = isSent ? "-" : "+";
        const amountColor = isSent ? "#EF4444" : "#10B981";

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
                  : isSent
                    ? { background: "rgba(239,68,68,0.1)" }
                    : { background: "rgba(16,185,129,0.1)" }
              }
            >
              {isPrivateTx ? (
                <Lock size={14} color="#A78BFA" />
              ) : isSent ? (
                <ArrowUpRight size={14} color="#EF4444" />
              ) : (
                <ArrowDownLeft size={14} color="#10B981" />
              )}
            </div>

            {/* Amount + mode badge */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold font-mono"
                style={{ color: isPrivateTx ? "#A78BFA" : amountColor }}
              >
                {isPrivateTx ? "" : amountPrefix}{tx.amount} {tx.tokenSymbol}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPrivateTx ? (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#A78BFA" }}
                  >
                    PRIVATE
                  </span>
                ) : (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-widest"
                    style={{ background: "rgba(37,99,235,0.08)", color: "var(--accent)" }}
                  >
                    PUBLIC
                  </span>
                )}
                <span className="text-[10px] font-mono" style={{ color: "var(--text-subtle)" }}>
                  {tx.status}
                </span>
              </div>
            </div>

            {/* Counterpart address (public only) */}
            <div className="text-right flex-shrink-0">
              {isPrivateTx ? (
                <p className="text-[11px] font-mono" style={{ color: "rgba(167,139,250,0.5)" }}>
                  Hidden
                </p>
              ) : counterpartName ? (
                <p className="text-[11px] font-mono truncate max-w-[100px]" style={{ color: "var(--text-muted)" }}>
                  {counterpartName}
                </p>
              ) : tx.txHash ? (
                <p className="text-[10px] font-mono" style={{ color: "var(--text-subtle)" }}>
                  {tx.txHash.slice(0, 6)}···{tx.txHash.slice(-4)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
