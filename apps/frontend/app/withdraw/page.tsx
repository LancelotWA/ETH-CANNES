"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { motion } from "framer-motion";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { Wallet, ArrowDown, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";

const TOKENS = [
  { symbol: "ETH", label: "Base Sepolia ETH" },
] as const;

type TokenSymbol = (typeof TOKENS)[number]["symbol"];

const UNLINK_TOKEN = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7";

export default function WithdrawPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const activeUserId = useAppStore((s) => s.activeUserId);
  const authToken = useAppStore((s) => s.authToken);

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<TokenSymbol>("ETH");
  const [toAddress, setToAddress] = useState("");
  const [useDefault, setUseDefault] = useState(true);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [poolBalance, setPoolBalance] = useState<string>("0");

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address ? `${address.slice(0, 6)}···${address.slice(-4)}` : "";

  const poolBalanceFormatted = formatUnits(BigInt(poolBalance), 18);
  const canWithdraw = Number(amount) > 0 && status !== "pending" && activeUserId;

  // Fetch pool balance
  const fetchPoolBalance = useCallback(async () => {
    if (!activeUserId || !authToken) return;
    try {
      const res = await api.get<{ balances: { amount: string; token: string }[] }>(
        `/unilink/balance/${activeUserId}`,
        authToken,
      );
      const tokenBalance = res.balances?.find((b) => b.token === UNLINK_TOKEN);
      if (tokenBalance) setPoolBalance(tokenBalance.amount);
    } catch {
      // Account may not exist yet
    }
  }, [activeUserId, authToken]);

  useEffect(() => {
    fetchPoolBalance();
  }, [fetchPoolBalance]);

  async function handleWithdraw() {
    if (!canWithdraw || !activeUserId || !address) return;
    setStatus("pending");
    setError(null);

    try {
      const destination = useDefault ? address : toAddress;
      if (!destination || !/^0x[a-fA-F0-9]{40}$/.test(destination)) {
        setError("Invalid destination address");
        setStatus("error");
        return;
      }

      const amountWei = parseUnits(amount, 18).toString();

      await api.post(
        "/unilink/withdraw",
        {
          userId: activeUserId,
          recipientEvmAddress: destination,
          token: UNLINK_TOKEN,
          amount: amountWei,
        },
        authToken,
      );

      setStatus("success");
      // Refresh pool balance
      await fetchPoolBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed");
      setStatus("error");
    }
  }

  const statusLabel =
    status === "pending"
      ? "WITHDRAWING..."
      : status === "success"
        ? "WITHDRAWN !"
        : "WITHDRAW";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 pb-28 px-4 max-w-md mx-auto"
    >
      <button
        onClick={() => router.back()}
        className="self-start flex items-center gap-1.5 mb-3 text-xs font-sans transition-opacity hover:opacity-60"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div
        className="w-full rounded-[24px] p-5 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.005)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          className="text-2xl font-bold tracking-tight text-center"
          style={{ color: "var(--text)" }}
        >
          <DecryptedText text="WITHDRAW" animateOn="view" speed={100} sequential />
        </h1>

        <p
          className="text-xs text-center font-sans"
          style={{ color: "var(--text-muted)" }}
        >
          Withdraw ULNKm from the Unlink privacy pool
        </p>

        {/* Wallet info */}
        <div
          className="flex items-center justify-between rounded-[14px] px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <Wallet size={14} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {shortAddr}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
              {formattedEth} ETH
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              ${formattedUsd}
            </p>
          </div>
        </div>

        {/* Pool balance */}
        <div
          className="rounded-[16px] p-4"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#A78BFA" }}
          >
            Available in pool
          </p>
          <p className="text-2xl font-bold" style={{ color: "#A78BFA" }}>
            {Number(poolBalanceFormatted).toFixed(4)} <span className="text-sm">ULNKm</span>
          </p>
        </div>

        {/* Source: privacy pool */}
        <p
          className="text-xs text-center font-mono"
          style={{ color: "#A78BFA" }}
        >
          Unlink Privacy Pool
        </p>

        {/* Arrow indicator */}
        <div className="flex justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <ArrowDown size={18} color="#A78BFA" />
          </div>
        </div>

        {/* Destination */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            To
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseDefault(true)}
              className="flex-1 py-2.5 rounded-[12px] text-xs font-semibold transition-all"
              style={{
                background: useDefault ? "var(--accent)" : "rgba(255,255,255,0.06)",
                color: useDefault ? "#fff" : "var(--text-muted)",
                border: `1px solid ${useDefault ? "transparent" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              My Wallet
            </button>
            <button
              onClick={() => setUseDefault(false)}
              className="flex-1 py-2.5 rounded-[12px] text-xs font-semibold transition-all"
              style={{
                background: !useDefault ? "var(--accent)" : "rgba(255,255,255,0.06)",
                color: !useDefault ? "#fff" : "var(--text-muted)",
                border: `1px solid ${!useDefault ? "transparent" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              Other Address
            </button>
          </div>
          {!useDefault && (
            <input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-[12px] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text)",
              }}
            />
          )}
        </div>

        {/* Token selector */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Token
          </p>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => setToken(t.symbol)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: token === t.symbol ? "var(--accent)" : "rgba(255,255,255,0.06)",
                  color: token === t.symbol ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${token === t.symbol ? "transparent" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Amount
          </p>
          <input
            type="number"
            min="0"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-[12px] px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text)",
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className="w-full py-3.5 rounded-[14px] text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              status === "success"
                ? "#10b981"
                : canWithdraw
                  ? "linear-gradient(135deg,#7C3AED,#6366F1)"
                  : "rgba(255,255,255,0.06)",
            color: canWithdraw || status === "success" ? "#fff" : "var(--text-subtle)",
            opacity: canWithdraw || status === "success" ? 1 : 0.5,
            boxShadow: canWithdraw ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
          }}
        >
          {statusLabel}
        </button>

        {error && (
          <p className="text-xs text-center font-semibold" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
        {status === "success" && (
          <p className="text-xs text-center font-semibold" style={{ color: "#10b981" }}>
            Withdraw confirmed — ULNKm sent to your wallet
          </p>
        )}
      </div>
    </motion.div>
  );
}
