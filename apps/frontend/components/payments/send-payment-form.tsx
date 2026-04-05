"use client";

import React, { FormEvent, useState } from "react";
import { useAccount, useBalance, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { Wallet } from "lucide-react";

const TOKENS = [
  { symbol: "ETH", label: "Base Sepolia ETH", decimals: 18, address: null },
  { symbol: "USDC", label: "USDC", decimals: 6, address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
  { symbol: "DAI", label: "DAI", decimals: 18, address: "0x68194a729C2450ad26072b3D33ADaCbcef39D574" },
  { symbol: "WETH", label: "WETH", decimals: 18, address: "0x4200000000000000000000000000000000000006" },
  { symbol: "SepoliaETH", label: "Sepolia ETH", decimals: 18, address: null },
] as const;

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type TokenSymbol = (typeof TOKENS)[number]["symbol"];

export function SendPaymentForm() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<TokenSymbol>("ETH");
  const [status, setStatus] = useState<"idle" | "sending" | "confirming" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address ? `${address.slice(0, 6)}···${address.slice(-4)}` : "";

  const selectedToken = TOKENS.find((t) => t.symbol === token)!;
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const canSend = isValidAddress && Number(amount) > 0 && status !== "sending" && status !== "confirming";

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (/^0x[a-fA-F0-9]{40}$/.test(text.trim())) {
        setRecipient(text.trim());
      }
    } catch {
      // clipboard permission denied
    }
  }

  async function handleScan() {
    // @ts-expect-error - BarcodeDetector is not yet in all TS libs
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        // @ts-expect-error - BarcodeDetector API
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        const detect = async (): Promise<string | null> => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0);
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            return barcodes[0].rawValue;
          }
          return null;
        };

        for (let i = 0; i < 50; i++) {
          const result = await detect();
          if (result) {
            const addr = result.startsWith("ethereum:") ? result.split(":")[1].split("@")[0] : result;
            if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
              setRecipient(addr);
              break;
            }
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        stream.getTracks().forEach((t) => t.stop());
      } catch {
        setError("Camera non disponible");
      }
    } else {
      setError("Scanner non supporté sur ce navigateur");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSend || !address) return;

    setStatus("sending");
    setError(null);
    setTxHash(null);

    try {
      let hash: `0x${string}`;

      if (selectedToken.address) {
        const parsedAmount = parseUnits(amount, selectedToken.decimals);
        hash = await writeContractAsync({
          address: selectedToken.address as `0x${string}`,
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [recipient as `0x${string}`, parsedAmount],
        });
      } else {
        const parsedAmount = parseEther(amount);
        hash = await sendTransactionAsync({
          to: recipient as `0x${string}`,
          value: parsedAmount,
        });
      }

      setTxHash(hash);
      setStatus("confirming");

      await waitForTransactionReceipt(wagmiConfig as never, { hash });

      setStatus("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("rejected") || msg.includes("denied")) {
        setError("Transaction cancelled");
      } else if (msg.includes("insufficient")) {
        setError("Insufficient funds");
      } else {
        setError("Transaction failed");
      }
      setStatus("error");
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
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
          className="w-full rounded-[12px] px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--text)",
          }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step={selectedToken.decimals === 6 ? "0.01" : "0.0001"}
          placeholder="0.00"
          required
        />
      </div>

      {/* Recipient */}
      <div>
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Recipient
        </p>
        <input
          className="w-full rounded-[12px] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--text)",
          }}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          required
        />
        <button
          type="button"
          onClick={handleScan}
          className="w-full mt-3 rounded-[12px] py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--text-muted)",
          }}
        >
          SCAN QR
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSend}
        className="w-full py-3.5 rounded-[14px] text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:
            status === "success"
              ? "#10b981"
              : status === "error"
                ? "#ef4444"
                : canSend
                  ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                  : "rgba(255,255,255,0.1)",
          color: canSend || status === "success" || status === "error" ? "#fff" : "var(--text-muted)",
          opacity: canSend || status === "success" || status === "error" ? 1 : 0.5,
          boxShadow: canSend ? "0 4px 16px rgba(37,99,235,0.35)" : "none",
        }}
      >
        {status === "sending"
          ? "SIGNING..."
          : status === "confirming"
            ? "CONFIRMING..."
            : status === "success"
              ? "SENT !"
              : status === "error"
                ? "FAILED"
                : "SEND"}
      </button>

      {/* Feedback */}
      {error && (
        <p className="text-xs text-center font-semibold" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      {status === "success" && txHash && (
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold" style={{ color: "#10b981" }}>
            Transaction confirmed
          </p>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </form>
  );
}
