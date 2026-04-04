"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-public/10 to-transparent opacity-50"></div>
        <div className="relative">
          <p className="text-xs uppercase tracking-wider text-public font-semibold mb-1">Connected Wallet</p>
          <p className="font-mono text-sm text-white">{address}</p>
          <button 
            className="mt-4 rounded-xl border border-border bg-surface-hover/50 px-4 py-2 text-xs font-medium text-text transition-colors hover:bg-white/10" 
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <p className="mb-4 text-sm text-text-muted">Connect a wallet to start sending payments.</p>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          className="mr-3 rounded-xl border border-public/30 bg-public/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-public/20 hover:border-public/50 disabled:opacity-50"
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}
