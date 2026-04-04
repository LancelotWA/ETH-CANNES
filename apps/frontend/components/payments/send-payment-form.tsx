"use client";

import React, { FormEvent, useState } from "react";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

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

type TokenSymbol = "ETH" | "USDC";

export function SendPaymentForm() {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<TokenSymbol>("ETH");
  const [status, setStatus] = useState<"idle" | "sending" | "confirming" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (token === "USDC") {
        const parsedAmount = parseUnits(amount, 6);
        hash = await writeContractAsync({
          address: USDC_BASE_SEPOLIA,
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
        setError("Transaction annulée");
      } else if (msg.includes("insufficient")) {
        setError("Fonds insuffisants");
      } else {
        setError("Transaction échouée");
      }
      setStatus("error");
    }
  }

  return (
    <form className="space-y-5 flex flex-col" onSubmit={onSubmit}>
      {/* Token selector */}
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Token</p>
        <div className="flex gap-2">
          {(["ETH", "USDC"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setToken(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-black uppercase tracking-wider transition-all ${
                token === t
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest">
        Amount
        <div className="relative mt-1">
          <span className="absolute left-0 top-1 text-white/50 font-black text-xl">
            {token === "USDC" ? "$" : "Ξ"}
          </span>
          <input
            className="w-full border-0 border-b-2 border-white/20 bg-transparent pl-6 pr-0 py-1 text-2xl font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step={token === "USDC" ? "0.01" : "0.0001"}
            placeholder="0.00"
            required
          />
        </div>
      </label>

      {/* Recipient */}
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Recipient</p>
        <input
          className="w-full border-0 border-b-2 border-white/20 bg-transparent px-0 py-1 text-base font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          required
        />
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handlePaste}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 py-2 text-xs font-black text-white/60 uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            PASTE ADDRESS
          </button>
          <button
            type="button"
            onClick={handleScan}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 py-2 text-xs font-black text-white/60 uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            SCAN QR
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSend}
        className={`w-full mt-2 rounded-[2rem] py-3 text-base font-black uppercase shadow-xl transition-all border ${
          status === "success"
            ? "bg-green-500 text-white border-green-400"
            : status === "error"
            ? "bg-red-500 text-white border-red-400"
            : canSend
            ? "bg-white text-black border-white/20 hover:scale-105 active:scale-95"
            : "opacity-30 cursor-not-allowed bg-white/10 text-white/40 border-white/20"
        }`}
      >
        {status === "sending"
          ? "SIGNING..."
          : status === "confirming"
            ? "CONFIRMING..."
            : status === "success"
            ? "SENT !"
            : status === "error"
            ? "DENIED"
            : "SEND"}
      </button>

      {/* Feedback */}
      {error && <p className="text-xs text-red-400 text-center font-bold tracking-wider">{error}</p>}
      {status === "success" && txHash && (
        <div className="text-center space-y-1">
          <p className="text-xs text-green-400 font-bold tracking-wider">SENT</p>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 underline hover:text-white/70 transition-colors"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </form>
  );
}
