"use client";

import { useState } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { postJson } from "@/lib/api";

// ENS lives on mainnet regardless of the active chain
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET)
});

const ENS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ensForwardCache = new Map<string, { value: string | null; expiresAt: number }>();
const ensReverseCache = new Map<string, { value: string | null; expiresAt: number }>();

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

export function useEnsName(address: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  async function resolve(): Promise<string | null> {
    const cached = ensReverseCache.get(address);
    if (cached && Date.now() < cached.expiresAt) {
      setEnsName(cached.value);
      return cached.value;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await postJson<{ ensName: string | null }>("/ens/reverse", { address });
      ensReverseCache.set(address, { value: response.ensName, expiresAt: Date.now() + ENS_CACHE_TTL });
      setEnsName(response.ensName);
      return response.ensName;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve ENS name");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { resolve, ensName, loading, error };
}

export function useEnsAddress(name: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ensAddress, setEnsAddress] = useState<string | null>(null);

  async function resolve(): Promise<string | null> {
    const cached = ensForwardCache.get(name);
    if (cached && Date.now() < cached.expiresAt) {
      setEnsAddress(cached.value);
      return cached.value;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await postJson<{ address: string | null }>("/ens/resolve", { ensName: name });
      ensForwardCache.set(name, { value: response.address, expiresAt: Date.now() + ENS_CACHE_TTL });
      setEnsAddress(response.address);
      return response.address;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve ENS address");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { resolve, ensAddress, loading, error };
}
