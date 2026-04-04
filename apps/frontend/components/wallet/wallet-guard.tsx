"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { WalletConnection } from "@/components/wallet/wallet-connection";
import { DecryptedText } from "@/components/ui/decrypted-text";

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents hydration mismatch
  }

  if (!isConnected) {
    return (
      <div className="h-[100dvh] w-full flex flex-col justify-center items-center p-4 relative z-50">
        <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter drop-shadow-2xl mb-12">
          <DecryptedText text="ICEBERG" animateOn="view" speed={160} sequential={true} className="metallic-text" />
        </h1>
        <div className="w-full max-w-sm flex justify-center">
          <WalletConnection />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
