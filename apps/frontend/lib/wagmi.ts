"use client";

import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

export const projectId = "8027c35a40a0968c3ec2fc940cca0553";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: true })
  ],
  transports: {
    [mainnet.id]: http()
  },
  ssr: true,
  multiInjectedProviderDiscovery: true
});
