"use client";

import { createConfig, http } from "wagmi";
import { base, mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [base, mainnet, sepolia],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA)
  },
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: "ETH Cannes Pay" })
  ],
  ssr: true
});
