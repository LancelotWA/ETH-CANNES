"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

import { Button } from "@ethcannes/ui";
import { useAuth } from "@/hooks/useAuth";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, viewingKey, login, logout, loading, error } = useAuth();

  if (isConnected && isAuthenticated) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm space-y-2">
        <p className="text-sm text-zinc-600">Connected wallet</p>
        <p className="font-mono text-sm truncate">{address}</p>
        <p className="text-xs text-emerald-600">✓ Authenticated</p>
        {viewingKey && (
          <p className="text-xs text-violet-500">✓ Viewing key derived</p>
        )}
        <Button
          className="mt-1"
          variant="ghost"
          onClick={() => { logout(); disconnect(); }}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  if (isConnected && !isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 shadow-sm space-y-3">
        <p className="text-sm text-zinc-600">Connected wallet</p>
        <p className="font-mono text-sm truncate">{address}</p>
        <p className="text-xs text-zinc-400">Sign to authenticate and derive your viewing key.</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button onClick={login} disabled={loading}>
          {loading ? "Signing..." : "Sign in"}
        </Button>
        <Button variant="ghost" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <p className="mb-3 text-sm text-zinc-600">Connect a wallet to start sending payments.</p>
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          className="mr-2"
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </Button>
      ))}
    </div>
  );
}
