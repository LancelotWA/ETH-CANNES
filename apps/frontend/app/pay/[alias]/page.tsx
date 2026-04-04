"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getJson, postJson } from "@/lib/api";
import type { PaymentLinkRecord } from "@ethcannes/types";
import { Button } from "@ethcannes/ui";
import { useAppStore } from "@/store/useAppStore";

function PayPage() {
  const { alias } = useParams<{ alias: string }>();
  const senderUserId = useAppStore((state) => state.activeUserId) ?? "";

  const [link, setLink] = useState<PaymentLinkRecord | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alias) return;
    getJson<PaymentLinkRecord>(`/payment-links/${alias}`)
      .then((l) => {
        setLink(l);
        if (l.amount) setAmount(String(l.amount));
      })
      .catch(() => setError("Payment link not found"))
      .finally(() => setLoading(false));
  }, [alias]);

  async function pay() {
    if (!link || !senderUserId) return;
    setPaying(true);
    try {
      await postJson("/payments", {
        senderUserId,
        recipientUserId: link.ownerId,
        amount: Number(amount),
        tokenSymbol: link.tokenSymbol,
        mode: link.mode
      });
      setStatus(`Payment of ${amount} ${link.tokenSymbol} sent!`);
    } catch {
      setError("Payment failed, please try again");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-zinc-400">Loading payment link…</div>;
  }

  if (error || !link) {
    return <div className="text-center py-12 text-red-500">{error ?? "Link not found"}</div>;
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
          disabled={paying || !amount || !senderUserId}
          className={`w-full rounded-xl py-4 font-bold text-white shadow-xl transition-all duration-300 ${
            paying || !amount || !senderUserId 
              ? "opacity-50 cursor-not-allowed bg-surface border border-border" 
              : "scale-[1.02] bg-public hover:bg-public/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 border-none"
          }`}
        >
          {paying ? "Sending secure transaction..." : `Pay ${amount || "0.00"} ${link.tokenSymbol}`}
        </button>
      )}
    </div>
  );
}

export default function PayPageWrapper() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pay</h1>
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <PayPage />
      </div>
    </div>
  );
}
