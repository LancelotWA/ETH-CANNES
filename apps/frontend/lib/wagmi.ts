"use client";

import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "ETH Cannes Pay",
        description: "Social crypto payments",
        url: "https://localhost:3000",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true,
});
