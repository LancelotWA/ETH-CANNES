"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { parseEther, parseUnits } from "viem";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { ArrowLeft, Copy, Check, Wallet, Lock, Globe } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const UNLINK_TOKEN = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7";
const BASE_SEPOLIA_CHAIN_ID = 84532;

type Mode = "preset" | "share";

export default function RequestPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const globalPaymentMode = useAppStore((s) => s.globalPaymentMode);
  const unlinkAddress = useAppStore((s) => s.unlinkAddress);
  const isPrivate = globalPaymentMode === "PRIVATE";

  const [mode, setMode] = useState<Mode | null>(null);
  const [amount, setAmount] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address
    ? `${address.slice(0, 6)}···${address.slice(-4)}`
    : "";

  // Build the QR payload depending on mode
  const qrPayload = (() => {
    if (isPrivate) {
      // Private mode: use unlink: URI scheme
      if (!unlinkAddress) return null;
      if (mode === "preset" && amount) {
        const amountWei = parseUnits(amount, 18).toString();
        return `unlink:${unlinkAddress}?amount=${amountWei}&token=${UNLINK_TOKEN}`;
      }
      if (mode === "share") {
        return `unlink:${unlinkAddress}`;
      }
      return null;
    } else {
      // Public mode: use EIP-681 ethereum: URI
      if (!address) return null;
      if (mode === "preset" && amount) {
        const amountWei = parseEther(amount).toString();
        return `ethereum:${address}@${BASE_SEPOLIA_CHAIN_ID}?value=${amountWei}`;
      }
      if (mode === "share") {
        return `ethereum:${address}@${BASE_SEPOLIA_CHAIN_ID}`;
      }
      return null;
    }
  })();

  // Human-readable display link
  const displayUrl = (() => {
    if (isPrivate) {
      if (!unlinkAddress) return null;
      const shortUnlink = `${unlinkAddress.slice(0, 12)}···${unlinkAddress.slice(-6)}`;
      if (mode === "preset" && amount) return `${shortUnlink} — ${amount} TST`;
      if (mode === "share") return shortUnlink;
      return null;
    } else {
      if (!address) return null;
      if (mode === "preset" && amount) return `${shortAddr} — ${amount} ETH`;
      if (mode === "share") return shortAddr;
      return null;
    }
  })();

  useEffect(() => {
    if (!qrPayload) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
    })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);
  }, [qrPayload]);

  const handleCopy = async () => {
    if (!qrPayload) return;
    await navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetMode = () => {
    setMode(null);
    setAmount("");
    setQrDataUrl(null);
  };

  const hasAddress = isPrivate ? !!unlinkAddress : !!address;

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

        {/* ── MODE BADGE ──────────────────────────── */}
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase"
            style={{
              background: isPrivate ? "rgba(139,92,246,0.15)" : "rgba(16,185,129,0.15)",
              color: isPrivate ? "#A78BFA" : "#10b981",
              border: `1px solid ${isPrivate ? "rgba(139,92,246,0.3)" : "rgba(16,185,129,0.3)"}`,
            }}
          >
            {isPrivate ? <Lock size={12} /> : <Globe size={12} />}
            {isPrivate ? "Private (Unlink)" : "Public (On-chain)"}
          </span>
        </div>

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
                {isPrivate && unlinkAddress
                  ? `${unlinkAddress.slice(0, 12)}···${unlinkAddress.slice(-6)}`
                  : shortAddr}
              </span>
            </div>
            {!isPrivate && (
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                  {formattedEth} ETH
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  ${formattedUsd}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── NO ADDRESS WARNING ──────────────────── */}
        {!hasAddress && (
          <p
            className="text-sm font-sans text-center"
            style={{ color: "var(--text-muted)" }}
          >
            {isPrivate
              ? "Switch to private mode first to get your Unlink address"
              : "Connect your wallet to generate a payment request"}
          </p>
        )}

        {/* ── MODE SELECTION ────────────────────────── */}
        {hasAddress && mode === null && (
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
              Fixed Amount
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
              {isPrivate ? "Share Unlink Address" : "Share Wallet Address"}
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
            {/* Token display */}
            <div>
              <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Token
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "1px solid transparent",
                  }}
                >
                  {isPrivate ? "TST (Unlink)" : "ETH (Base Sepolia)"}
                </span>
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
        {qrPayload && (
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
                  border: `1px solid ${isPrivate ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <img
                  src={qrDataUrl}
                  alt="Payment QR Code"
                  className="w-[200px] h-[200px] object-contain"
                />
              </div>
            )}

            {/* Display info */}
            {displayUrl && (
              <p
                className="text-xs font-mono text-center"
                style={{ color: "var(--text-muted)" }}
              >
                {displayUrl}
              </p>
            )}

            {/* Copy raw URI */}
            <div className="w-full flex gap-2">
              <input
                readOnly
                value={qrPayload}
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
                style={{ color: isPrivate ? "#A78BFA" : "var(--text-muted)" }}
              >
                {amount} {isPrivate ? "TST" : "ETH"}
              </p>
            )}

            {isPrivate && (
              <p
                className="text-[10px] font-sans text-center"
                style={{ color: "rgba(167,139,250,0.6)" }}
              >
                Scan with ETH Cannes Pay to send a private payment
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
