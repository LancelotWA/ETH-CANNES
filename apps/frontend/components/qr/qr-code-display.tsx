"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useApiMutation } from "@/hooks/useApi";
import type { PaymentMode, QrCodeRecord, QrCodeType } from "@ethcannes/types";

interface QrCodeDisplayProps {
  ownerId: string;
}

export function QrCodeDisplay({ ownerId }: QrCodeDisplayProps) {
  const [type, setType] = useState<QrCodeType>("ONE_TIME");
  const [mode, setMode] = useState<PaymentMode>("PUBLIC");
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState<QrCodeRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const { mutateAsync: generateQr, isPending: loading } = useApiMutation<QrCodeRecord>("POST", "/qr-codes");

  async function generate() {
    try {
      const result = await generateQr({
        ownerId,
        type,
        mode,
        amount: amount ? Number(amount) : undefined,
        tokenSymbol: "USDC"
      });
      setQr(result);
    } catch (e: unknown) {
      console.error(e);
    }
  }

  const qrUrl = qr ? `${window.location.origin}/pay/qr/${qr.id}` : null;

  useEffect(() => {
    if (qrUrl) {
      QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#00000000'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [qrUrl]);

  return (
    <div className="glass-card space-y-5 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white tracking-tight border-b border-border pb-3">Request money via QR</h2>

      <fieldset className="flex gap-2 bg-surface p-1 rounded-xl border border-border">
        {(["ONE_TIME", "PERMANENT"] as QrCodeType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
              type === t
                ? "bg-white/10 text-white shadow-inner"
                : "text-text-muted hover:text-white"
            }`}
          >
            {t === "ONE_TIME" ? "One-time use" : "Reusable"}
          </button>
        ))}
      </fieldset>

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
              {isPublic ? "🌐 Public" : "🔒 Private"}
            </button>
          );
        })}
      </fieldset>

      <label className="block text-sm font-medium text-text-muted">
        Amount (optional – leave empty for open amount)
        <div className="relative mt-2">
          <span className="absolute left-4 top-3 text-text-muted font-bold">$</span>
          <input
            className="w-full rounded-xl border border-border bg-surface pl-8 pr-4 py-3 text-white placeholder-text-muted focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Open amount"
          />
        </div>
      </label>

      <button 
        type="button" 
        onClick={generate} 
        disabled={loading}
        className={`w-full mt-4 rounded-xl py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
          loading ? "opacity-50 cursor-not-allowed bg-surface" : mode === "PRIVATE" ? "bg-private hover:bg-private/90" : "bg-public hover:bg-public/90"
        }`}
      >
        {loading ? "Generating..." : "Generate QR code"}
      </button>

      {qr && qrUrl && qrDataUrl && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-surface/80 p-6 flex flex-col items-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Scan to Pay</p>
          
          <div className="mb-5 rounded-xl bg-surface shadow-[0_0_20px_rgba(255,255,255,0.05)] p-4 border border-white/5">
            <img src={qrDataUrl} alt="Payment QR Code" className="w-48 h-48" />
          </div>

          <p className="mb-4 text-xs font-semibold text-white/80">
            {qr.type === "ONE_TIME" ? "Single-use" : "Reusable"} ·{" "}
            {qr.mode === "PRIVATE" ? <span className="text-private">Private</span> : <span className="text-public">Public</span>}
            {qr.amount ? ` · ${Number(qr.amount)} USDC` : " · Open amount"}
          </p>

          <input
            className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-xs font-mono text-text-muted text-center focus:outline-none"
            readOnly
            value={qrUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
}
