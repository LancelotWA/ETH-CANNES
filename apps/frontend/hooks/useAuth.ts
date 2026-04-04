"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { keccak256, toBytes } from "viem";

import { getJson, postJson } from "@/lib/api";
import type { AuthNonceResponse, VerifyWalletPayload, VerifyWalletResponse, WalletAddress } from "@ethcannes/types";

const AUTH_STORAGE_KEY = "ethcannes.auth.v1";
const VIEWING_KEY_MESSAGE = "ETH Cannes Pay - derive viewing key v1";

interface AuthState {
  walletAddress: WalletAddress | null;
  jwt: string | null;
  viewingKey: `0x${string}` | null;
}

interface StoredAuthState {
  walletAddress: WalletAddress;
  jwt: string;
  viewingKey: `0x${string}`;
}

function readStoredAuth(): StoredAuthState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthState>;
    if (
      typeof parsed.walletAddress === "string" &&
      typeof parsed.jwt === "string" &&
      typeof parsed.viewingKey === "string"
    ) {
      return {
        walletAddress: parsed.walletAddress as WalletAddress,
        jwt: parsed.jwt,
        viewingKey: parsed.viewingKey as `0x${string}`
      };
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return null;
}

function writeStoredAuth(state: StoredAuthState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<AuthState>({ walletAddress: null, jwt: null, viewingKey: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) return;

    setState({
      walletAddress: stored.walletAddress,
      jwt: stored.jwt,
      viewingKey: stored.viewingKey
    });
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      if (state.jwt || state.viewingKey || state.walletAddress) {
        setState({ walletAddress: null, jwt: null, viewingKey: null });
        clearStoredAuth();
      }
      return;
    }

    if (
      state.walletAddress &&
      state.walletAddress.toLowerCase() !== address.toLowerCase()
    ) {
      setState({ walletAddress: null, jwt: null, viewingKey: null });
      clearStoredAuth();
    }
  }, [address, isConnected, state.jwt, state.viewingKey, state.walletAddress]);

  async function login() {
    if (!address) {
      setError("Connect a wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1 — get nonce from backend
      const { nonce, message } = await getJson<AuthNonceResponse>(
        `/auth/nonce?address=${encodeURIComponent(address)}`
      );

      // Step 2 — user signs the nonce message
      const signature = await signMessageAsync({ message });

      // Step 3 — verify signature on backend → get JWT
      const payload: VerifyWalletPayload = {
        walletAddress: address,
        nonce,
        signature
      };
      const { jwt } = await postJson<VerifyWalletResponse>("/auth/verify", payload);

      // Step 4 — derive viewing key locally (never sent to backend)
      const viewingKeySignature = await signMessageAsync({
        message: `${VIEWING_KEY_MESSAGE}\nWallet: ${address}`
      });
      const viewingKey = keccak256(toBytes(viewingKeySignature));

      const nextState: AuthState = { walletAddress: address, jwt, viewingKey };
      setState(nextState);
      writeStoredAuth({
        walletAddress: address,
        jwt,
        viewingKey
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setState({ walletAddress: null, jwt: null, viewingKey: null });
    clearStoredAuth();
  }

  const isAuthenticated =
    !!address &&
    !!state.jwt &&
    !!state.walletAddress &&
    state.walletAddress.toLowerCase() === address.toLowerCase();

  return {
    jwt: state.jwt,
    viewingKey: state.viewingKey,
    isAuthenticated,
    login,
    logout,
    loading,
    error
  };
}
