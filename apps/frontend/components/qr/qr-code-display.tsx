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
    <div className="space-y-6 flex flex-col">

      <fieldset className="flex gap-4">
        {(["ONE_TIME", "PERMANENT"] as QrCodeType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 pb-2 border-b-2 font-black tracking-widest text-base uppercase transition-all duration-300 ${type === t ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
          >
            {t === "ONE_TIME" ? "ONE-TIME" : "REUSABLE"}
          </button>
        ))}
      </fieldset>

      <fieldset className="flex gap-4">
        {(["PUBLIC", "PRIVATE"] as PaymentMode[]).map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 pb-2 border-b-2 font-black tracking-widest text-base uppercase transition-all duration-300 ${isActive ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}
            >
              {m}
            </button>
          );
        })}
      </fieldset>

      <label className="block text-sm font-bold text-white/50 uppercase tracking-widest">
        AMOUNT (OPTIONAL)
        <div className="relative mt-1">
          <span className="absolute left-0 top-2 text-white/50 font-black text-2xl">$</span>
          <input
            className="w-full border-0 border-b-2 border-white/20 bg-transparent pl-8 pr-0 py-2 text-3xl leading-none font-black text-white focus:ring-0 focus:border-white transition-all placeholder-white/10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="OPEN"
          />
        </div>
      </label>

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className={`w-full mt-6 rounded-[2rem] py-4 text-xl font-black uppercase shadow-2xl transition-all hover:scale-105 active:scale-95 ${loading ? "opacity-50 cursor-not-allowed bg-white/20 text-white" : "bg-white text-black"}`}
      >
        {loading ? "GENERATING..." : "GENERATE QR"}
      </button>

      {qr && qrUrl && qrDataUrl && (
        <div className="mt-8 text-center animate-in fade-in zoom-in duration-500">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#10b981]">SCAN TO PAY</p>

          <div className="inline-block bg-white p-3 border-4 border-black shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <img src={qrDataUrl} alt="Payment QR Code" className="w-[120px] h-[120px] object-contain" />
          </div>

          <p className="mt-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
            {qr.type} · {qr.mode}
            {qr.amount ? ` · ${Number(qr.amount)} USDC` : " · OPEN"}
          </p>

          <input
            className="w-full border-0 border-b-2 border-white/20 bg-transparent px-0 py-2 text-sm font-mono text-white text-center focus:outline-none"
            readOnly
            value={qrUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
}
