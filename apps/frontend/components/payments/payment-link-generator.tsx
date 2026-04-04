"use client";

import { useState } from "react";

import { Button } from "@ethcannes/ui";

interface PaymentLinkGeneratorProps {
  address: `0x${string}`;
}

type PaymentMode = "PUBLIC" | "PRIVATE";

export function PaymentLinkGenerator({ address }: PaymentLinkGeneratorProps) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");

  const payUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${address}${amount ? `?amount=${amount}` : ""}`;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Create payment link</h2>

      <fieldset className="flex gap-2">
        <legend className="mb-1 block text-sm font-medium">Privacy</legend>
        {(["PUBLIC", "PRIVATE"] as PaymentMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              mode === m
                ? m === "PRIVATE"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            ].join(" ")}
          >
            {m === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
          </button>
        ))}
      </fieldset>

      <label className="block text-sm">
        Fixed amount (optional)
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="Open amount"
        />
      </label>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="mb-2 text-xs font-medium text-emerald-700">Your payment link</p>
        <input
          className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-mono text-zinc-700"
          readOnly
          value={payUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    </div>
  );
}
