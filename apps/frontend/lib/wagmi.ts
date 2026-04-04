"use client";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, baseSepolia, mainnet, sepolia } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const networks = [baseSepolia, base, mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
