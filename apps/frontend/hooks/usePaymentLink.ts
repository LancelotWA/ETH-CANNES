"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface UsePaymentLinkReturn {
  paymentLink: string;
}

export function usePaymentLink(ensNameOrAddress: string): UsePaymentLinkReturn {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://phntm.app";
  const paymentLink = `${origin}/pay/${ensNameOrAddress}`;
  return { paymentLink };
}

interface UseQRCodeReturn {
  qrCodeUrl: string | null;
  isLoading: boolean;
}

export function useQRCode(value: string): UseQRCodeReturn {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!value) return;

    setIsLoading(true);
    setQrCodeUrl(null);

    QRCode.toDataURL(value, { margin: 2, width: 256 })
      .then((url) => setQrCodeUrl(url))
      .catch(() => setQrCodeUrl(null))
      .finally(() => setIsLoading(false));
  }, [value]);

  return { qrCodeUrl, isLoading };
}
