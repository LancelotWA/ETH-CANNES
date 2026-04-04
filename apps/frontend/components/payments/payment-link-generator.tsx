"use client";

import { useState } from "react";
import { useApiMutation } from "@/hooks/useApi";
import type { PaymentLinkRecord, PaymentMode } from "@ethcannes/types";
import { useAppStore } from "@/store/useAppStore";

interface PaymentLinkGeneratorProps {
  ownerId: string;
}

export function PaymentLinkGenerator({ ownerId }: PaymentLinkGeneratorProps) {
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [link, setLink] = useState<PaymentLinkRecord | null>(null);
  
  const globalMode = useAppStore((state) => state.globalPaymentMode);

  const { mutateAsync: generateLink, isPending: loading, error } = useApiMutation<PaymentLinkRecord>("POST", "/payment-links");

  async function generate() {
    try {
      const result = await generateLink({
        ownerId,
        alias: alias.toLowerCase().trim(),
        amount: amount ? Number(amount) : undefined,
        tokenSymbol: "USDC",
        mode: globalMode
      });
      setLink(result);
    } catch (e: unknown) {
      console.error(e);
    }
  }

  const payUrl = link ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${link.alias}` : null;

  async function copyToClipboard() {
    if (payUrl) {
      await navigator.clipboard.writeText(payUrl);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div className="space-y-6 flex flex-col">

      <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">
        ALIAS
        <div className="flex border-0 border-b-2 border-white/20 mt-1 focus-within:border-white transition-colors overflow-hidden">
          <span className="flex items-center text-white/50 bg-transparent py-2 text-2xl font-black select-none">/pay/</span>
          <input
            className="w-full bg-transparent px-2 py-2 text-2xl text-white font-black placeholder-white/10 focus:outline-none focus:ring-0 lowercase"
            value={alias}
            onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="alice"
            maxLength={40}
          />
        </div>
      </label>

      <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">
        FIXED AMOUNT (OPTIONAL)
        <div className="relative mt-1">
          <span className="absolute left-0 top-2 text-white/50 font-black text-2xl">$</span>
          <input
            className="w-full border-0 border-b-2 border-white/20 bg-transparent pl-8 pr-0 py-2 text-3xl leading-none font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="OPEN"
          />
        </div>
      </label>

      <button 
        type="button" 
        onClick={generate} 
        disabled={loading || !alias}
        className={`w-full mt-6 rounded-[2rem] py-4 text-xl font-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 ${
          loading || !alias ? "opacity-50 cursor-not-allowed bg-white/20 text-white" : "bg-white text-black"
        }`}
      >
        {loading ? "CREATING..." : "CREATE LINK"}
      </button>

      {error && <p className="text-sm text-red-400 mt-2 text-center font-bold tracking-wider">{error.message}</p>}

      {link && payUrl && (
        <div className="mt-6 border-t border-white/20 pt-6 text-center animate-in fade-in zoom-in duration-500">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#10b981]">LINK READY</p>
          <div className="flex gap-2">
            <input
              className="w-full border border-white/20 bg-black/40 px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-white"
              readOnly
              value={payUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 text-sm bg-white text-black font-black hover:scale-105 active:scale-95 transition-transform"
            >
              COPY
            </button>
          </div>
          <p className="mt-3 text-[10px] text-white/50 uppercase font-bold tracking-wider">
            {link.amount ? `FIXED: ${Number(link.amount)} USDC` : "OPEN AMOUNT"}
          </p>
        </div>
      )}
    </div>
  );
}
