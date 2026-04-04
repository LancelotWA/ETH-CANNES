"use client";

import { useState } from "react";

import { Button } from "@ethcannes/ui";

interface QrCodeDisplayProps {
  address: `0x${string}`;
}

export function QrCodeDisplay({ address }: QrCodeDisplayProps) {
  const [amount, setAmount] = useState("");

  const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${address}${amount ? `?amount=${amount}` : ""}`;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Request via QR</h2>

      <label className="block text-sm">
        Amount (optional)
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

      <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-center">
        <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-xl bg-white shadow">
          <span className="text-4xl">▦</span>
        </div>
        <input
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-mono text-zinc-600"
          readOnly
          value={qrUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    </div>
  );
}
