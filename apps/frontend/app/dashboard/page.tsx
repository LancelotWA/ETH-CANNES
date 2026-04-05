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
  const activeUserId = useAppStore((s) => s.activeUserId);
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
  const hasBalance = balance && balance.value > 0n;
  const ethAmt = balance
    ? Number(balance.value) / 10 ** balance.decimals
    : 0;
  const formattedEth = hasBalance ? ethAmt.toFixed(4) : "—";
  const formattedUsd = hasBalance ? (ethAmt * ETH_PRICE).toFixed(2) : "—";

  const shortAddr = address
    ? `${address.slice(0, 6)}···${address.slice(-4)}`
    : "";

  const actions = [
    { label: "Send", icon: Send, href: "/send" },
    { label: "Request", icon: ArrowDownLeft, href: "/request" },
  ] as const;

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center pb-28 max-w-md mx-auto px-4 pt-4"
    >
      {/* ── GLASS CONTAINER ──────────────────────────── */}
      <div
        className="w-full flex-1 rounded-[24px] p-5 flex flex-col gap-4"
        style={{
          background: "rgba(255,255,255,0.005)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <span
          className="text-xs font-sans"
          style={{ color: "var(--text-muted)" }}
        >
          {isPrivate ? "Stealth mode" : "Open mode"}
        </span>

        <div className="flex items-center gap-2">
          {/* Address chip */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
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

      {/* ── BALANCES ───────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {isPrivate && (
          <div
            className="relative overflow-hidden rounded-[20px] p-6"
            style={{
              background: "linear-gradient(145deg,rgba(26,26,28,0.8) 0%,rgba(17,17,19,0.8) 100%)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 0 48px rgba(124,58,237,0.15)",
            }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-widest" style={{ background: "rgba(124,58,237,0.18)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#A78BFA", boxShadow: "0 0 6px rgba(167,139,250,0.8)" }} />
              PRIVATE
            </div>

            <p className="text-xs font-sans mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              Unlink Pool Balance
            </p>

            <div className="flex items-end gap-3 mb-1">
              <h2 className="text-[2.75rem] font-bold leading-none tracking-tight text-white" style={{ filter: !balanceVisible ? "blur(16px)" : "none", transition: "filter 0.3s ease" }}>
                $0.00
              </h2>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="mb-1.5 transition-opacity hover:opacity-60" style={{ color: "rgba(255,255,255,0.4)" }} aria-label={balanceVisible ? "Hide balance" : "Show balance"}>
                {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <p className="text-sm font-sans" style={{ color: "rgba(255,255,255,0.6)", filter: !balanceVisible ? "blur(8px)" : "none", transition: "filter 0.3s ease" }}>
              0.0000 ETH
            </p>

            {/* Claimable balance */}
            <div
              className="mt-4 rounded-[14px] p-4"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#A78BFA" }}>
                Claimable
              </p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-bold" style={{ color: "#A78BFA" }}>
                  0.00 <span className="text-xs">ETH</span>
                </p>
                <button
                  className="px-3 py-1.5 rounded-[8px] text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    color: "#A78BFA",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  CLAIM
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <TransitionLink href="/deposit" className="flex-1 py-2.5 rounded-[12px] text-[11px] font-bold font-sans tracking-widest text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(135deg,#7C3AED,#6366F1)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                DEPOSIT
              </TransitionLink>
              <TransitionLink href="/withdraw" className="flex-1 py-2.5 rounded-[12px] text-[11px] font-bold font-sans tracking-widest text-[#A78BFA] text-center transition-all hover:bg-white/10 active:scale-[0.98]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.15)" }}>
                WITHDRAW
              </TransitionLink>
            </div>
          </div>
        )}

        {/* Main/Public Balance */}
        <div
          className={`relative overflow-hidden ${isPrivate ? "rounded-[16px] p-4 flex items-center justify-between" : "rounded-[20px] p-6"}`}
          style={isPrivate ? { background: "var(--surface)", border: "1px solid var(--border)" } : { background: "linear-gradient(145deg,rgba(37,99,235,0.85) 0%,rgba(29,78,216,0.85) 100%)", backdropFilter: "blur(12px)", boxShadow: "0 12px 40px rgba(37,99,235,0.25)" }}
        >
          {!isPrivate && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-widest" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white" />
              PUBLIC
            </div>
          )}

          <div>
            <p className={`font-sans ${isPrivate ? "text-[10px] mb-1.5" : "text-xs mb-3"}`} style={{ color: isPrivate ? "var(--text-muted)" : "rgba(255,255,255,0.7)" }}>
              {isPrivate ? "PUBLIC WALLET BALANCE" : "Total Balance"}
            </p>
            <div className={`flex items-end ${isPrivate ? "gap-2" : "gap-3 mb-1"}`}>
              <h2 className={`${isPrivate ? "text-xl" : "text-[2.75rem]"} font-bold leading-none tracking-tight text-[#fff]`}>
                ${formattedUsd}
              </h2>
            </div>
            {!isPrivate && (
              <p className="text-sm font-sans" style={{ color: "rgba(255,255,255,0.6)" }}>
                {formattedEth} ETH
              </p>
            )}
          </div>

          {isPrivate && (
            <div className="text-right">
              <p className="text-[11px] font-sans" style={{ color: "var(--text-muted)" }}>
                {formattedEth} ETH
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION BUTTONS ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, icon: Icon, href }) => (
          <TransitionLink
            key={label}
            href={href}
            className="btn-press flex items-center justify-center gap-3 py-5 rounded-[16px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 4px 16px var(--accent-dim)",
            }}
          >
            <Icon size={22} color="#fff" />
            <span className="text-sm font-bold">
              {label}
            </span>
          </TransitionLink>
        ))}
      </div>


      {/* ── RECENT ACTIVITY ────────────────────────────── */}
      <div className="mt-2 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[11px] font-sans font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Recent activity
          </h3>
          <TransitionLink
            href="/feed"
            className="text-[11px] font-sans transition-opacity hover:opacity-60"
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
                  className="text-xs font-sans animate-pulse px-4 py-5"
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
              className="text-xs font-sans px-4 py-5"
              style={{ color: "var(--text-subtle)" }}
            >
              No activity yet
            </p>
          )}
        </div>
      </div>

      </div>{/* end glass container */}
    </div>
  );
}
