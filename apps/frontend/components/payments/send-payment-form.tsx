"use client";

import React, { FormEvent, useState } from "react";

import { useEnsResolution } from "@/hooks/useEnsResolution";
import { postJson } from "@/lib/api";
import { Button } from "@ethcannes/ui";

interface SendPaymentFormProps {
  senderUserId: string;
}

export function SendPaymentForm({ senderUserId }: SendPaymentFormProps) {
  const [ensInput, setEnsInput] = useState("bob.eth");
  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("Coffee");
  const [status, setStatus] = useState<string | null>(null);
  const { resolveEns, loading, error } = useEnsResolution();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);

    const resolution = await resolveEns(ensInput);
    if (!resolution?.address) {
      setStatus("Recipient ENS not found");
      return;
    }

    await postJson("/payments", {
      senderUserId,
      recipientUserId: "123e4567-e89b-12d3-a456-426614174000",
      amount: Number(amount),
      tokenSymbol: "USDC",
      note
    });

    setStatus(`Payment queued for ${ensInput}`);
  }

  return (
    <form className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Send payment</h2>
      <label className="block text-sm">
        Recipient ENS
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
          value={ensInput}
          onChange={(e) => setEnsInput(e.target.value)}
          placeholder="alice.eth"
        />
      </label>
      <label className="block text-sm">
        Amount (USDC)
        <input
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.01"
        />
      </label>
      <label className="block text-sm">
        Note
        <input className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <Button type="submit" disabled={loading}>{loading ? "Resolving ENS..." : "Send"}</Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
    </form>
  );
}
