"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { motion } from "framer-motion";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { Wallet, ArrowDown } from "lucide-react";

const TOKENS = [
  { symbol: "ETH", label: "Base Sepolia ETH" },
  { symbol: "USDC", label: "USDC" },
  { symbol: "DAI", label: "DAI" },
  { symbol: "WETH", label: "WETH" },
] as const;

type TokenSymbol = (typeof TOKENS)[number]["symbol"];

export default function DepositPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<TokenSymbol>("ETH");
  const [fromAddress, setFromAddress] = useState("");
  const [useDefault, setUseDefault] = useState(true);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address ? `${address.slice(0, 6)}···${address.slice(-4)}` : "";

  const canDeposit = Number(amount) > 0 && status !== "pending";

  async function handleDeposit() {
    if (!canDeposit) return;
    setStatus("pending");
    // TODO: call backend POST /api/unilink/deposit
    // const source = useDefault ? address : fromAddress;
    // await fetch(...)
    setTimeout(() => setStatus("idle"), 1500); // placeholder
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 pb-28 px-4 max-w-md mx-auto"
    >
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
          <DecryptedText text="DEPOSIT" animateOn="view" speed={100} sequential />
        </h1>

        <p
          className="text-xs text-center font-sans"
          style={{ color: "var(--text-muted)" }}
        >
          Deposit tokens into the Unlink privacy pool
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

        {/* Source address toggle */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            From
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
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
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

        <p
          className="text-xs text-center font-mono"
          style={{ color: "#A78BFA" }}
        >
          Unlink Privacy Pool
        </p>

        {/* Submit */}
        <button
          onClick={handleDeposit}
          disabled={!canDeposit}
          className="w-full py-3.5 rounded-[14px] text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: canDeposit
              ? "linear-gradient(135deg,#7C3AED,#6366F1)"
              : "rgba(255,255,255,0.06)",
            color: canDeposit ? "#fff" : "var(--text-subtle)",
            opacity: canDeposit ? 1 : 0.5,
            boxShadow: canDeposit ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
          }}
        >
          {status === "pending" ? "DEPOSITING..." : "DEPOSIT"}
        </button>
      </div>
    </motion.div>
  );
}
