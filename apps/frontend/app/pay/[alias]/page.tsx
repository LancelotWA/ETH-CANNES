"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";

import { Button } from "@ethcannes/ui";

export default function PayPage() {
  const { alias } = useParams<{ alias: string }>();
  const { address } = useAccount();

  // Payment via wagmi/viem will be wired in Phase 2
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Pay</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">/{alias}</p>
        </div>
        {!address && (
          <p className="text-center text-sm text-zinc-500">Connect your wallet to pay</p>
        )}
        {address && (
          <Button type="button" disabled>
            Payment flow coming in Phase 2
          </Button>
        )}
      </div>
    </div>
  );
}
