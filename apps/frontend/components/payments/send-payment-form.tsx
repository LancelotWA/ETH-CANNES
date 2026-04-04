"use client";

import React, { FormEvent, useState } from "react";

import { resolveEns } from "@/lib/public/ens";
import { sendPublicPayment } from "@/lib/public/transactions";
import { shortenAddress } from "@/lib/public/helpers";
import { Button } from "@ethcannes/ui";
import type { WalletAddress } from "@ethcannes/types";

type PaymentMode = "PUBLIC" | "PRIVATE";

interface SendPaymentFormProps {
  senderAddress: WalletAddress;
}

export function SendPaymentForm({ senderAddress }: SendPaymentFormProps) {
  const [ensInput, setEnsInput] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      if (mode === "PUBLIC") {
        // Resolve ENS or use raw address
        let recipientAddress: WalletAddress;
        if (ensInput.endsWith(".eth")) {
          const resolved = await resolveEns(ensInput);
          if (!resolved) {
            setStatus("Recipient ENS not found");
            return;
          }
          recipientAddress = resolved;
        } else if (ensInput.startsWith("0x") && ensInput.length === 42) {
          recipientAddress = ensInput as WalletAddress;
        } else {
          setStatus("Invalid address or ENS name");
          return;
        }

        const { txHash } = await sendPublicPayment({
          to: recipientAddress,
          amount,
          note: note || undefined,
        });

        setStatus(`Sent! Tx: ${shortenAddress(txHash)}`);
        setAmount("");
        setNote("");
        setEnsInput("");
        return;
      }

      // Phase 3: wire Unlink SDK here
      setStatus("Private payment via Unlink — wired in Phase 3");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm"
      onSubmit={onSubmit}
    >
      <h2 className="text-lg font-semibold">Send payment</h2>
      <p className="font-mono text-xs text-zinc-400">{senderAddress}</p>

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
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400",
            ].join(" ")}
          >
            {m === "PUBLIC" ? "Public" : "Private (Unlink)"}
          </button>
        ))}
      </fieldset>

      {mode === "PRIVATE" && (
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-700">
          Sender and recipient are hidden on-chain via Unlink ZK proofs.
        </p>
      )}

      {mode === "PUBLIC" && (
        <label className="block text-sm">
          Recipient ENS or address
          <input
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            value={ensInput}
            onChange={(e) => setEnsInput(e.target.value)}
            placeholder="alice.eth or 0x..."
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

      {mode === "PUBLIC" && (
        <label className="block text-sm">
          Note (visible in feed)
          <input
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={240}
            placeholder="Coffee ☕"
          />
        </label>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : mode === "PRIVATE" ? "Send privately" : "Send"}
      </Button>

      {status && (
        <p
          className={`text-sm ${
            status.startsWith("Sent") ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
