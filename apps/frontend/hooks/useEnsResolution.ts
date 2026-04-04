"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";

interface EnsResolutionResult {
  ensName: string;
  address: string | null;
}

export function useEnsResolution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveEns(ensName: string): Promise<EnsResolutionResult | null> {
    setLoading(true);
    setError(null);
    try {
      const response = await postJson<EnsResolutionResult>("/ens/resolve", { ensName });
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve ENS");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { resolveEns, loading, error };
}
