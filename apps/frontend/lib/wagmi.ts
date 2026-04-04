"use client";

import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, mainnet, sepolia],
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
    coinbaseWallet({ appName: "ETH Cannes Pay" }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA),
  },
  ssr: true,
  multiInjectedProviderDiscovery: true,
});
