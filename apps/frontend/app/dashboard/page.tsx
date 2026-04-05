"use client";

import { Suspense, useState, useEffect } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { TransactionHistory } from "@/components/history/transaction-history";
import { TransitionLink } from "@/components/ui/transition-link";
import { Send, ArrowDownLeft, QrCode, Eye, EyeOff, LogOut } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const activeUserId = useAppStore((s) => s.activeUserId);
  const authToken = useAppStore((s) => s.authToken);
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const storeDisconnect = useAppStore((s) => s.disconnect);
  const isPrivate = globalPaymentMode === "PRIVATE";

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [unlinkBalances, setUnlinkBalances] = useState<{ token: string; amount: string }[]>([]);

  useEffect(() => {
    console.log("[balance] activeUserId:", activeUserId, "authToken:", !!authToken, "isPrivate:", isPrivate);
    if (!activeUserId || !authToken || !isPrivate) return;
    console.log("[balance] fetching...");
    api.get<{ balances: { token: string; amount: string }[] }>(
      `/unilink/balance/${activeUserId}`,
      authToken,
    )
      .then((res) => { console.log("[balance] result:", res); setUnlinkBalances(res.balances ?? []); })
      .catch((err) => { console.error("[balance] error:", err); setUnlinkBalances([]); });
  }, [activeUserId, authToken, isPrivate]);

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

      {/* ── BALANCES ───────────────────────────────── */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {isPrivate && (
          <div
            className="relative overflow-hidden rounded-[20px] p-6"
            style={{
              background: "linear-gradient(145deg,#1A1A1C 0%,#111113 100%)",
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
                {unlinkBalances.length === 0 ? "$0.00" : `${(Number(unlinkBalances[0].amount) / 1e18).toFixed(4)}`}
              </h2>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="mb-1.5 transition-opacity hover:opacity-60" style={{ color: "rgba(255,255,255,0.4)" }} aria-label={balanceVisible ? "Hide balance" : "Show balance"}>
                {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <p className="text-sm font-sans" style={{ color: "rgba(255,255,255,0.6)", filter: !balanceVisible ? "blur(8px)" : "none", transition: "filter 0.3s ease" }}>
              {unlinkBalances.length === 0
                ? "0.0000 tokens"
                : unlinkBalances.map((b) => `${(Number(b.amount) / 1e18).toFixed(4)} ${b.token.slice(0, 6)}…`).join(" · ")}
            </p>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2.5 rounded-[12px] text-[11px] font-bold font-sans tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(135deg,#7C3AED,#6366F1)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                DEPOSIT
              </button>
              <button className="flex-1 py-2.5 rounded-[12px] text-[11px] font-bold font-sans tracking-widest text-[#A78BFA] transition-all hover:bg-white/10 active:scale-[0.98]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.15)" }}>
                WITHDRAW
              </button>
            </div>
          </div>
        )}

        {/* Main/Public Balance */}
        <div
          className={`relative overflow-hidden ${isPrivate ? "rounded-[16px] p-4 flex items-center justify-between" : "rounded-[20px] p-6"}`}
          style={isPrivate ? { background: "var(--surface)", border: "1px solid var(--border)" } : { background: "linear-gradient(145deg,#2563EB 0%,#1D4ED8 100%)", boxShadow: "0 12px 40px rgba(37,99,235,0.35)" }}
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
      <div className="grid grid-cols-2 gap-3 px-4 mt-5">
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
              className="text-xs font-sans font-medium"
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
    </div>
  );
}
