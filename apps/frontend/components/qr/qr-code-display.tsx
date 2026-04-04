"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";
import type { PaymentMode, QrCodeRecord, QrCodeType } from "@ethcannes/types";
import { Button } from "@ethcannes/ui";

interface QrCodeDisplayProps {
  ownerId: string;
}

export function QrCodeDisplay({ ownerId }: QrCodeDisplayProps) {
  const [type, setType] = useState<QrCodeType>("ONE_TIME");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState<QrCodeRecord | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const result = await postJson<QrCodeRecord>("/qr-codes", {
        ownerId,
        type,
        mode,
        amount: amount ? Number(amount) : undefined,
        tokenSymbol: "USDC"
      });
      setQr(result);
    } finally {
      setLoading(false);
    }
  }

  const qrUrl = qr ? `${window.location.origin}/pay/qr/${qr.id}` : null;

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Request money via QR</h2>

      <fieldset className="flex gap-2">
        <legend className="mb-1 block text-sm font-medium">Type</legend>
        {(["ONE_TIME", "PERMANENT"] as QrCodeType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              type === t
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            ].join(" ")}
          >
            {t === "ONE_TIME" ? "One-time" : "Permanent"}
          </button>
        ))}
      </fieldset>

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
        Amount (optional – leave empty for open amount)
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

      <Button type="button" onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate QR code"}
      </Button>

      {qr && qrUrl && (
        <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-center">
          <p className="mb-3 text-xs text-zinc-500">
            {qr.type === "ONE_TIME" ? "Single-use" : "Reusable"} ·{" "}
            {qr.mode === "PRIVATE" ? "Private" : "Public"}
            {qr.amount ? ` · ${Number(qr.amount)} USDC` : " · Open amount"}
          </p>
          {/* QR image placeholder – integrate a real QR library in production */}
          <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-xl bg-white shadow">
            <span className="text-4xl">▦</span>
          </div>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600"
            readOnly
            value={qrUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
}
