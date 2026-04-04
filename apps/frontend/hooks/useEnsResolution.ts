"use client";

import { useState } from "react";

export function useEnsResolution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveEns(name: string): Promise<{ address: string } | null> {
    setLoading(true);
    setError(null);
    try {
      // Mocking ENS resolution for demo purposes. 
      // In production, integrate with wagmi getEnsAddress or backend API
      await new Promise(r => setTimeout(r, 600)); 
      if (!name) return null;
      if (name.endsWith('.eth')) {
        return { address: "0x123...456" }; // mock address
      }
      return { address: "0x" + Math.random().toString(16).substr(2, 40) }; 
    } catch (e) {
      setError("Failed to resolve ENS");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { resolveEns, loading, error };
}