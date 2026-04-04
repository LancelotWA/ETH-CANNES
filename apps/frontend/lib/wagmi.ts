"use client";

import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  },
  ssr: true,
  multiInjectedProviderDiscovery: true
});

export const appMetadata = {
  name: "ETH Cannes Pay",
  description: "Social crypto payments",
  url: "https://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

export const walletConnectConfig = {
  projectId: walletConnectProjectId
};
