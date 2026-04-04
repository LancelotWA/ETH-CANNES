"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";
import type { PaymentLinkRecord, PaymentMode } from "@ethcannes/types";
import { Button } from "@ethcannes/ui";

interface PaymentLinkGeneratorProps {
  ownerId: string;
}

export function PaymentLinkGenerator({ ownerId }: PaymentLinkGeneratorProps) {
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [link, setLink] = useState<PaymentLinkRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const result = await postJson<PaymentLinkRecord>("/payment-links", {
        ownerId,
        alias: alias.toLowerCase().trim(),
        amount: amount ? Number(amount) : undefined,
        tokenSymbol: "USDC",
        mode
      });
      setLink(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  }

  const payUrl = link ? `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${link.alias}` : null;

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
        Your alias (e.g. alice → /pay/alice)
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 font-mono lowercase"
          value={alias}
          onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="alice"
          maxLength={40}
        />
      </label>

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

      <Button type="button" onClick={generate} disabled={loading || !alias}>
        {loading ? "Creating..." : "Create link"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {link && payUrl && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="mb-2 text-xs font-medium text-emerald-700">Your payment link is ready!</p>
          <input
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-mono text-zinc-700"
            readOnly
            value={payUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <p className="mt-2 text-xs text-emerald-600">
            Share it on WhatsApp, social media, or embed in your bio.
            {link.amount ? ` Fixed: ${Number(link.amount)} USDC.` : " Open amount – payer decides."}
          </p>
        </div>
      )}
    </div>
  );
}
