"use client";

import React, { FormEvent, useState } from "react";

import { useEnsResolution } from "@/hooks/useEnsResolution";
import { postJson } from "@/lib/api";
import type { PaymentMode } from "@ethcannes/types";
import { Button } from "@ethcannes/ui";

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
      // In a real app, look up the user ID by wallet address
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
    <form
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">Send payment</h2>

      {/* Mode toggle */}
      <fieldset className="flex gap-2">
        <legend className="mb-1 block text-sm font-medium">Payment mode</legend>
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
            {m === "PUBLIC" ? "🌐 Public" : "🔒 Private (UNILINK)"}
          </button>
        ))}
      </fieldset>

      {mode === "PRIVATE" && (
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
          The recipient identity and your relationship will remain hidden on-chain.
          A ghost contact will be created in your contacts list.
        </p>
      )}

      {mode === "PUBLIC" && (
        <label className="block text-sm">
          Recipient ENS
          <input
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            value={ensInput}
            onChange={(e) => setEnsInput(e.target.value)}
            placeholder="alice.eth"
            required
          />
        </label>
      )}

      <label className="block text-sm">
        Amount (USDC)
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          required
        />
      </label>

      <label className="block text-sm">
        Note {mode === "PUBLIC" ? "(visible in feed)" : "(private, not shared)"}
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
          placeholder={mode === "PUBLIC" ? "Coffee ☕" : "Optional private memo"}
        />
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Resolving ENS..." : mode === "PRIVATE" ? "Send privately" : "Send"}
      </Button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
    </form>
  );
}
