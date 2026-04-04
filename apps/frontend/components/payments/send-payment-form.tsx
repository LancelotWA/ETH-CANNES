"use client";

import React, { FormEvent, useState } from "react";

import { useEnsResolution } from "@/hooks/useEnsResolution";
import { postJson } from "@/lib/api";
import type { PaymentMode } from "@ethcannes/types";

interface SendPaymentFormProps {
  senderUserId: string;
}

export function SendPaymentForm({ senderUserId }: SendPaymentFormProps) {
  const [ensInput, setEnsInput] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [status, setStatus] = useState<string | null>(null);
  const { resolveEns, loading, error } = useEnsResolution();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);

    let recipientUserId: string | undefined;

    if (mode === "PUBLIC") {
      const resolution = await resolveEns(ensInput);
      if (!resolution?.address) {
        setStatus("Recipient ENS not found");
        return;
      }
      recipientUserId = resolution.address;
    }

    await postJson("/payments", {
      senderUserId,
      recipientUserId,
      amount: Number(amount),
      tokenSymbol: "USDC",
      mode,
      note: note || undefined
    });

    const label = mode === "PRIVATE" ? "Private payment sent via UNILINK" : `Payment queued for ${ensInput}`;
    setStatus(label);
  }

  return (
    <form className="glass-card space-y-5 rounded-2xl p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-bold text-white tracking-tight border-b border-border pb-3">Send payment</h2>

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
              {isPublic ? "🌐 Public" : "🔒 Private (UNILINK)"}
            </button>
          );
        })}
      </fieldset>

      <div className={`transition-all duration-500 overflow-hidden ${mode === "PRIVATE" ? "max-h-24 opacity-100 mt-4" : "max-h-0 opacity-0 m-0"}`}>
        <div className="rounded-xl bg-private/10 border border-private/20 px-4 py-3 text-xs text-private-dim font-medium flex items-start gap-2">
          <span className="text-private mt-0.5">ℹ</span>
          <p className="text-private/90 leading-relaxed">The recipient identity and your relationship will remain hidden on-chain. A ghost contact will be created in your contacts list.</p>
        </div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${mode === "PUBLIC" ? "max-h-24 opacity-100" : "max-h-0 opacity-0 m-0"}`}>
        {mode === "PUBLIC" && (
          <label className="block text-sm font-medium text-text-muted mt-2">
            Recipient ENS
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder-text-muted focus:border-public focus:outline-none focus:ring-1 focus:ring-public transition-all"
              value={ensInput}
              onChange={(e) => setEnsInput(e.target.value)}
              placeholder="alice.eth"
              required={mode === "PUBLIC"}
            />
          </label>
        )}
      </div>

      <label className="block text-sm font-medium text-text-muted">
        Amount (USDC)
        <div className="relative mt-2">
          <span className="absolute left-4 top-3 text-text-muted font-bold">$</span>
          <input
            className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-3 text-white placeholder-text-muted focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>
      </label>

      <label className="block text-sm font-medium text-text-muted">
        Note {mode === "PUBLIC" ? <span className="text-public/70 ml-1">(visible in feed)</span> : <span className="text-private/70 ml-1">(private, not shared)</span>}
        <input
          className={`mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder-border-hover focus:outline-none focus:ring-1 transition-all ${mode === "PUBLIC" ? "focus:border-public focus:ring-public" : "focus:border-private focus:ring-private"}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
          placeholder={mode === "PUBLIC" ? "Coffee ☕" : "Optional private memo"}
        />
      </label>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full mt-4 rounded-xl py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
          loading ? "opacity-50 cursor-not-allowed bg-surface" : mode === "PRIVATE" ? "bg-private hover:bg-private/90" : "bg-public hover:bg-public/90"
        }`}
      >
        {loading ? "Resolving ENS..." : mode === "PRIVATE" ? "Send privately" : "Send public payment"}
      </button>

      {error ? <p className="text-sm text-danger mt-2 text-center bg-danger/10 py-2 rounded-lg border border-danger/20">{error}</p> : null}
      {status ? <p className="text-sm text-public mt-2 text-center bg-public/10 py-2 rounded-lg border border-public/20">{status}</p> : null}
    </form>
  );
}
