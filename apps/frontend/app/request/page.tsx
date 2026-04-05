"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { ArrowLeft, Copy, Check, Wallet } from "lucide-react";

const TOKENS = [
  { symbol: "ETH", label: "ETH", chain: "Base Sepolia" },
  { symbol: "USDC", label: "USDC", chain: "Base Sepolia" },
  { symbol: "DAI", label: "DAI", chain: "Base Sepolia" },
  { symbol: "WETH", label: "WETH", chain: "Base Sepolia" },
  { symbol: "SepoliaETH", label: "Sepolia ETH", chain: "Sepolia" },
] as const;

type Mode = "preset" | "share";

export default function RequestPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [mode, setMode] = useState<Mode | null>(null);
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<string>("ETH");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address
    ? `${address.slice(0, 6)}···${address.slice(-4)}`
    : "";

  const payUrl =
    mode === "preset" && amount && address
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${address}?amount=${amount}&token=${token}`
      : mode === "share" && address
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${address}`
        : null;

  useEffect(() => {
    if (!payUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(payUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
    })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);
  }, [payUrl]);

  const handleCopy = async () => {
    if (!payUrl) return;
    await navigator.clipboard.writeText(payUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetMode = () => {
    setMode(null);
    setAmount("");
    setQrDataUrl(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 pb-28 px-4 max-w-md mx-auto"
    >
      {/* ── GLASS CONTAINER ──────────────────────────── */}
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
          <DecryptedText text="REQUEST" animateOn="view" speed={100} sequential />
        </h1>

        {/* ── WALLET INFO ──────────────────────────── */}
        {isConnected && (
          <div
            className="flex items-center justify-between rounded-[14px] px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <Wallet size={14} style={{ color: "var(--accent)" }} />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {shortAddr}
              </span>
            </div>
            <div className="text-right">
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text)" }}
              >
                {formattedEth} ETH
              </p>
              <p
                className="text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                ${formattedUsd}
              </p>
            </div>
          </div>
        )}

        {/* ── MODE SELECTION ────────────────────────── */}
        {mode === null && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode("preset")}
              className="w-full py-4 rounded-[16px] text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 4px 16px var(--accent-dim)",
              }}
            >
              Predefined Amount
            </button>
            <button
              onClick={() => setMode("share")}
              className="w-full py-4 rounded-[16px] text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text)",
              }}
            >
              Share My Address
            </button>
          </div>
        )}

        {/* ── BACK BUTTON ──────────────────────────── */}
        {mode !== null && (
          <button
            onClick={resetMode}
            className="self-start flex items-center gap-1.5 text-xs font-sans transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        {/* ── PRESET AMOUNT MODE ───────────────────── */}
        {mode === "preset" && (
          <div className="flex flex-col gap-5">
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
                      background:
                        token === t.symbol ? "var(--accent)" : "rgba(255,255,255,0.06)",
                      color: token === t.symbol ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${token === t.symbol ? "transparent" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
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
          </div>
        )}

        {/* ── QR + LINK DISPLAY ────────────────────── */}
        {payUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {qrDataUrl && (
              <div
                className="p-4 rounded-[20px]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src={qrDataUrl}
                  alt="Payment QR Code"
                  className="w-[200px] h-[200px] object-contain"
                />
              </div>
            )}

            <div className="w-full flex gap-2">
              <input
                readOnly
                value={payUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 rounded-[12px] px-3 py-2.5 text-xs font-mono truncate focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-muted)",
                }}
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-[12px] text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: copied ? "#10b981" : "var(--accent)",
                  color: "#fff",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            {mode === "preset" && (
              <p
                className="text-[11px] font-sans"
                style={{ color: "var(--text-muted)" }}
              >
                {amount} {token}
              </p>
            )}
          </motion.div>
        )}

        {/* Share mode — no wallet */}
        {mode === "share" && !address && (
          <p
            className="text-sm font-sans text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Connect your wallet to share your address
          </p>
        )}
      </div>
    </motion.div>
  );
}
