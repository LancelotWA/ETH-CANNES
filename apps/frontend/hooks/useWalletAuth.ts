"use client";

import { useState } from "react";
import { useConnect, useDisconnect, useAccount, useSignMessage } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

interface UseWalletAuthReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  address: `0x${string}` | undefined;
  error: string | null;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectAsync } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { setAuth, clearAuth } = useAppStore();

  const connector = wagmiConfig.connectors[0];

  async function connect(): Promise<void> {
    setError(null);
    setIsConnecting(true);

    try {
      const { accounts } = await connectAsync({ connector });
      const connectedAddress = accounts[0];

      let nonce: string;
      try {
        const nonceRes = await fetch(
          `${BACKEND_URL}/auth/nonce?address=${connectedAddress}`
        );
        if (!nonceRes.ok) throw new Error();
        const data = await nonceRes.json();
        nonce = data.nonce;
      } catch {
        setError("Serveur indisponible");
        return;
      }

      let signature: string;
      try {
        signature = await signMessageAsync({ message: nonce });
      } catch {
        setError("Signature refusée");
        return;
      }

      try {
        const verifyRes = await fetch(`${BACKEND_URL}/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: connectedAddress, signature, nonce }),
        });
        if (!verifyRes.ok) throw new Error();
        const { jwt, userId } = await verifyRes.json();
        setAuth(userId, jwt);
      } catch {
        setError("Serveur indisponible");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      // User closed the modal → silent catch
      if (
        message.includes("rejected") ||
        message.includes("closed") ||
        message.includes("User rejected")
      ) {
        return;
      }
      setError("Connexion échouée");
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect(): void {
    wagmiDisconnect();
    clearAuth();
    setError(null);
  }

  return { connect, disconnect, isConnecting, isConnected, address, error };
}
