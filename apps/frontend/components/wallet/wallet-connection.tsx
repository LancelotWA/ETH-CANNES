"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

import { Button } from "@ethcannes/ui";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm">
        <p className="text-sm text-zinc-600">Connected wallet</p>
        <p className="mt-1 font-mono text-sm">{address}</p>
        <Button className="mt-3" variant="ghost" onClick={() => disconnect()}>
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
