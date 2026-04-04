"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppProviders } from "@/components/providers/app-providers";
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
    <div className="mx-auto max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Pay</p>
        <p className="mt-1 text-2xl font-bold text-zinc-900">/{alias}</p>
        {link.mode === "PRIVATE" && (
          <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-0.5 text-xs text-violet-700">
            🔒 Private payment
          </span>
        )}
      </div>

      {link.amount ? (
        <p className="text-center text-3xl font-bold">
          {Number(link.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} {link.tokenSymbol}
        </p>
      ) : (
        <label className="block text-sm">
          Amount ({link.tokenSymbol})
          <input
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-center text-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </label>
      )}

      {status ? (
        <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-700">{status}</p>
      ) : (
        <Button type="button" onClick={pay} disabled={paying || !amount || !senderUserId}>
          {paying ? "Sending…" : `Pay ${amount || "…"} ${link.tokenSymbol}`}
        </Button>
      )}
    </div>
  );
}

export default function PayPageWrapper() {
  return (
    <AppProviders>
      <div className="flex min-h-screen items-center justify-center px-4">
        <PayPage />
      </div>
    </AppProviders>
  );
}
