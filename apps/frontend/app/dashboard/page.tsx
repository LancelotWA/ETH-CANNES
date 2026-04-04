"use client";

import { Suspense, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { TransactionHistory } from "@/components/history/transaction-history";
import { TransitionLink } from "@/components/ui/transition-link";
import { Send, ArrowDownLeft, QrCode, Eye, EyeOff, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const activeUserId    = useAppStore((s) => s.activeUserId);
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const storeDisconnect = useAppStore((s) => s.disconnect);
  const isPrivate = globalPaymentMode === "PRIVATE";

  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleDisconnect = () => {
    disconnect();
    storeDisconnect(); // resets adminBypass + auth state
    router.push("/");
  };

  const ETH_PRICE = 3500;
  const ethAmt = balance
    ? Number(balance.value) / 10 ** balance.decimals
    : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);

  const shortAddr = address
    ? `${address.slice(0, 6)}···${address.slice(-4)}`
    : "";

  const actions = [
    { label: "Send", icon: Send, href: "/send" },
    { label: "Request", icon: ArrowDownLeft, href: "/request" },
    { label: "Request QR", icon: QrCode, href: "/request" },
  ] as const;

  return (
    <div
      className="min-h-[100dvh] flex flex-col pb-28 max-w-md mx-auto"
      style={{ background: "var(--bg)" }}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2 pl-[168px]">
        {/* pl-[168px] clears the fixed toggle (148px) + gap */}
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {isPrivate ? "Stealth mode" : "Open mode"}
        </span>

        <div className="flex items-center gap-2">
          {/* Address chip */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"
              style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
            />
            {shortAddr}
          </div>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            className="p-1.5 rounded-full transition-opacity hover:opacity-60"
            style={{ color: "var(--text-subtle)" }}
            aria-label="Disconnect"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── BALANCE CARD ───────────────────────────────── */}
      <div className="px-4 mt-4">
        <div
          className="relative overflow-hidden rounded-[20px] p-6"
          style={
            isPrivate
              ? {
                  background:
                    "linear-gradient(145deg,#1A1A1C 0%,#111113 100%)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  boxShadow: "0 0 48px rgba(124,58,237,0.15)",
                }
              : {
                  background:
                    "linear-gradient(145deg,#2563EB 0%,#1D4ED8 100%)",
                  boxShadow: "0 12px 40px rgba(37,99,235,0.35)",
                }
          }
        >
          {/* Mode badge */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest"
            style={
              isPrivate
                ? {
                    background: "rgba(124,58,237,0.18)",
                    color: "#A78BFA",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }
                : {
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                  }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isPrivate ? "#A78BFA" : "#fff",
                boxShadow: isPrivate
                  ? "0 0 6px rgba(167,139,250,0.8)"
                  : "none",
              }}
            />
            {isPrivate ? "PRIVATE" : "PUBLIC"}
          </div>

          {/* Label */}
          <p
            className="text-xs font-mono mb-3"
            style={{ color: isPrivate ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)" }}
          >
            Total Balance
          </p>

          {/* Main balance */}
          <div className="flex items-end gap-3 mb-1">
            <h2
              className="text-[2.75rem] font-bold leading-none tracking-tight"
              style={{
                color: "#fff",
                filter:
                  isPrivate && !balanceVisible
                    ? "blur(16px)"
                    : "none",
                transition: "filter 0.3s ease",
                userSelect: isPrivate && !balanceVisible ? "none" : "auto",
              }}
            >
              ${formattedUsd}
            </h2>

            {isPrivate && (
              <button
                onClick={() => setBalanceVisible((v) => !v)}
                className="mb-1.5 transition-opacity hover:opacity-60"
                style={{ color: "rgba(255,255,255,0.4)" }}
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
              >
                {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
          </div>

          {/* ETH sub-label */}
          <p
            className="text-sm font-mono"
            style={{
              color: isPrivate ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)",
              filter:
                isPrivate && !balanceVisible ? "blur(8px)" : "none",
              transition: "filter 0.3s ease",
            }}
          >
            {formattedEth} ETH
          </p>
        </div>
      </div>

      {/* ── ACTION BUTTONS ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-5">
        {actions.map(({ label, icon: Icon, href }) => (
          <TransitionLink
            key={label}
            href={href}
            className="btn-press flex flex-col items-center gap-2.5 py-4 rounded-[16px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Icon container */}
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center transition-colors"
              style={{
                background: "var(--accent-dim)",
              }}
            >
              <Icon size={20} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="text-xs font-mono font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </span>
          </TransitionLink>
        ))}
      </div>


      {/* ── RECENT ACTIVITY ────────────────────────────── */}
      <div className="px-4 mt-6 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[11px] font-mono font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Recent activity
          </h3>
          <TransitionLink
            href="/feed"
            className="text-[11px] font-mono transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </TransitionLink>
        </div>

        <div
          className="rounded-[16px] overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {activeUserId ? (
            <Suspense
              fallback={
                <p
                  className="text-xs font-mono animate-pulse px-4 py-5"
                  style={{ color: "var(--text-subtle)" }}
                >
                  Loading…
                </p>
              }
            >
              <TransactionHistory userId={activeUserId} compact />
            </Suspense>
          ) : (
            <p
              className="text-xs font-mono px-4 py-5"
              style={{ color: "var(--text-subtle)" }}
            >
              No activity yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
