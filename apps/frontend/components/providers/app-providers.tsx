"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";

import { wagmiAdapter, projectId, networks } from "@/lib/wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";

const metadata = {
  name: "ETH Cannes Pay",
  description: "Social crypto payments",
  url: typeof window !== "undefined" ? window.location.origin : "https://ethcannes.pay",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

createAppKit({
  adapters: [wagmiAdapter as never],
  projectId,
  networks: networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: baseSepolia,
  metadata,
  features: {
    analytics: false,
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
