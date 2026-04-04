"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";

const ENS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ensForwardCache = new Map<string, { value: string | null; expiresAt: number }>();
const ensReverseCache = new Map<string, { value: string | null; expiresAt: number }>();

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
