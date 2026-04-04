"use client";

import { useState } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// ENS lives on mainnet regardless of the active chain
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET)
});

export function useEnsResolution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveEns(ensName: string): Promise<`0x${string}` | null> {
    setLoading(true);
    setError(null);
    try {
      const address = await ensClient.getEnsAddress({ name: ensName });
      return address ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve ENS");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function lookupAddress(address: `0x${string}`): Promise<string | null> {
    try {
      return await ensClient.getEnsName({ address });
    } catch {
      return null;
    }
  }

  return { resolveEns, lookupAddress, loading, error };
}
