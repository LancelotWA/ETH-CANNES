"use client";

import { useState } from "react";
import { useApiMutation } from "@/hooks/useApi";
import type { PaymentLinkRecord, PaymentMode } from "@ethcannes/types";

interface PaymentLinkGeneratorProps {
  ownerId: string;
}

export function PaymentLinkGenerator({ ownerId }: PaymentLinkGeneratorProps) {
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [link, setLink] = useState<PaymentLinkRecord | null>(null);

  const { mutateAsync: generateLink, isPending: loading, error } = useApiMutation<PaymentLinkRecord>("POST", "/payment-links");

  async function generate() {
    try {
      const result = await generateLink({
        ownerId,
        alias: alias.toLowerCase().trim(),
        amount: amount ? Number(amount) : undefined,
        tokenSymbol: "USDC",
        mode
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
    <div className="glass-card space-y-5 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white tracking-tight border-b border-border pb-3">Create payment link</h2>

      <fieldset className="flex gap-2 bg-surface p-1 rounded-xl border border-border">
        {(["PUBLIC", "PRIVATE"] as PaymentMode[]).map((m) => {
          const isActive = mode === m;
          const isPublic = m === "PUBLIC";
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? isPublic
                    ? "bg-public/20 text-public shadow-[0_0_15px_rgba(16,185,129,0.3)] shadow-inner"
                    : "bg-private/20 text-private shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-inner"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {isPublic ? "🌐 Public Link" : "🔒 Private Link"}
            </button>
          );
        })}
      </fieldset>

      <label className="block text-sm font-medium text-text-muted">
        Your alias (e.g. alice → /pay/alice)
        <div className="flex bg-surface rounded-xl border border-border mt-2 focus-within:border-white transition-colors overflow-hidden">
          <span className="flex items-center px-4 text-text-muted bg-surface-hover select-none">/pay/</span>
          <input
            className="w-full bg-transparent px-2 py-3 text-white placeholder-text-muted/50 focus:outline-none focus:ring-0 font-mono lowercase"
            value={alias}
            onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="alice"
            maxLength={40}
          />
        </div>
      </label>

      <label className="block text-sm font-medium text-text-muted">
        Fixed amount (optional)
        <div className="relative mt-2">
          <span className="absolute left-4 top-3 text-text-muted font-bold">$</span>
          <input
            className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-3 text-white placeholder-text-muted focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Open amount"
          />
        </div>
      </label>

      <button 
        type="button" 
        onClick={generate} 
        disabled={loading || !alias}
        className={`w-full mt-4 rounded-xl py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
          loading || !alias ? "opacity-50 cursor-not-allowed bg-surface" : mode === "PRIVATE" ? "bg-private hover:bg-private/90" : "bg-public hover:bg-public/90"
        }`}
      >
        {loading ? "Creating..." : "Create link"}
      </button>

      {error && <p className="text-sm text-danger mt-2 text-center bg-danger/10 py-2 rounded-lg border border-danger/20">{error.message}</p>}

      {link && payUrl && (
        <div className="mt-6 rounded-2xl border border-public/30 bg-public/10 p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-public/20 to-transparent opacity-30"></div>
          <div className="relative">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-public">Your payment link is ready!</p>
            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-public/30 bg-surface/50 px-3 py-3 text-sm font-mono text-white focus:outline-none"
                readOnly
                value={payUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button 
                onClick={copyToClipboard}
                className="rounded-lg bg-public/20 hover:bg-public/40 transition-colors px-4 text-public font-bold border border-public/30"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-public/80 leading-relaxed font-medium">
              Share it on WhatsApp, social media, or embed in your bio.
              {link.amount ? (
                <span className="block mt-0.5 text-white">Fixed: {Number(link.amount)} USDC.</span>
              ) : (
                <span className="block mt-0.5 text-white">Open amount – payer decides.</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
