"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getJson, postJson } from "@/lib/api";
import type { PaymentLinkRecord } from "@ethcannes/types";

function PayPage() {
  const { alias } = useParams<{ alias: string }>();
  const [link, setLink] = useState<PaymentLinkRecord | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const senderUserId = useAppStore((state) => state.activeUserId);

  useEffect(() => {
    if (alias) {
      getJson<PaymentLinkRecord>(`/payment-links/alias/${alias}`)
        .then(setLink)
        .catch(console.error);
    }
  }, [alias]);

  if (!link) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-white/40 font-bold uppercase tracking-widest animate-pulse">LOADING...</p>
      </div>
    );
  }

  async function pay() {
    if (!link) return;
    setPaying(true);
    try {
      await postJson("/payments", {
        senderUserId,
        paymentLinkId: link.id,
        amount: amount ? Number(amount) : Number(link.amount),
        tokenSymbol: link.tokenSymbol,
        mode: link.mode,
      });
      setStatus(`Payment of ${amount || link.amount} ${link.tokenSymbol} sent!`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="glass-card mx-auto max-w-sm space-y-6 rounded-3xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-public/20 to-transparent blur-[100px] pointer-events-none"></div>

      <div className="text-center relative">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted/80 mb-2">Checkout</p>
        <p className="text-3xl font-extrabold text-white tracking-tight">/{alias}</p>
        {link.mode === "PRIVATE" && (
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-private-dim border border-private/20 px-3 py-1 text-xs font-semibold text-private shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            <span>🔒</span> Private link
          </span>
        )}
      </div>

      <div className="py-6 border-y border-border">
        {link.amount ? (
          <p className="text-center text-5xl font-black text-public drop-shadow-md">
            {Number(link.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xl font-bold ml-1">{link.tokenSymbol}</span>
          </p>
        ) : (
          <label className="block text-sm font-medium text-text-muted text-center">
            Specify amount to send
            <div className="relative mt-3 max-w-[200px] mx-auto">
              <span className="absolute left-4 top-3.5 text-text-muted font-bold">$</span>
              <input
                className="w-full rounded-2xl border-2 border-border bg-surface pl-8 pr-4 py-3 text-center text-2xl font-bold text-white placeholder-text-muted/30 focus:border-public focus:outline-none transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs mt-2 text-text-muted/60 uppercase tracking-widest">{link.tokenSymbol}</p>
          </label>
        )}
      </div>

      {status ? (
        <div className="rounded-xl border border-public/30 bg-public-dim p-4 text-center animate-in fade-in zoom-in duration-300">
          <p className="text-sm font-bold text-public">✨ Payment Successful!</p>
          <p className="text-xs text-white/80 mt-1">{status}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={pay}
          disabled={paying || (!amount && !link.amount) || !senderUserId}
          className={`w-full rounded-xl py-4 font-bold text-white shadow-xl transition-all duration-300 ${
            paying || (!amount && !link.amount) || !senderUserId
              ? "opacity-50 cursor-not-allowed bg-surface border border-border"
              : "scale-[1.02] bg-public hover:bg-public/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 border-none"
          }`}
        >
          {paying ? "Sending secure transaction..." : `Pay ${amount || link.amount || "0.00"} ${link.tokenSymbol}`}
        </button>
      )}
    </div>
  );
}

export default function PayPageWrapper() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <PayPage />
    </div>
  );
}
