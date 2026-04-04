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
    <form className="space-y-3 flex flex-col" onSubmit={onSubmit}>

      <fieldset className="flex gap-4">
        {(["PUBLIC", "PRIVATE"] as PaymentMode[]).map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 pb-1 border-b-2 font-black tracking-widest text-sm md:text-base uppercase transition-all duration-300 ${
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              {m}
            </button>
          );
        })}
      </fieldset>

      <div className={`transition-all duration-500 overflow-hidden ${mode === "PRIVATE" ? "max-h-24 opacity-100 mt-1" : "max-h-0 opacity-0 m-0"}`}>
        <div className="border border-white/20 bg-black/40 px-4 py-2 text-xs text-white/70 font-medium">
          <p>UNILINK stealth routing activated.</p>
        </div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${mode === "PUBLIC" ? "max-h-24 opacity-100" : "max-h-0 opacity-0 m-0"}`}>
        {mode === "PUBLIC" && (
          <label className="block text-xs font-bold text-white/50 uppercase tracking-widest">
            Recipient
            <input
              className="mt-0 w-full border-0 border-b-2 border-white/20 bg-transparent px-0 py-1 text-xl md:text-2xl font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
              value={ensInput}
              onChange={(e) => setEnsInput(e.target.value)}
              placeholder="alice.eth"
              required={mode === "PUBLIC"}
            />
          </label>
        )}
      </div>

      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest">
        Amount (USDC)
        <div className="relative mt-0">
          <span className="absolute left-0 top-1 text-white/50 font-black text-xl">$</span>
          <input
            className="w-full border-0 border-b-2 border-white/20 bg-transparent pl-6 pr-0 py-1 text-2xl font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
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

      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest">
        Note
        <input
          className="mt-0 w-full border-0 border-b-2 border-white/20 bg-transparent px-0 py-1 text-base md:text-lg font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
          placeholder="For dinner"
        />
      </label>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full mt-2 rounded-[2rem] py-2 text-base font-black uppercase shadow-xl transition-all hover:scale-105 active:scale-95 ${
          loading ? "opacity-50 cursor-not-allowed bg-white/20 text-white" : "bg-white text-black"
        }`}
      >
        {loading ? "PROCESSING..." : "CONFIRM"}
      </button>

      {error ? <p className="text-xs text-red-400 mt-2 text-center font-bold tracking-wider">{error}</p> : null}
      {status ? <p className="text-xs text-green-400 mt-2 text-center font-bold tracking-wider">{status}</p> : null}
    </form>
  );
}
