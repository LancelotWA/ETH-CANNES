import type { WalletAddress } from "@ethcannes/types";

/** USDC contract addresses per chain ID */
export const USDC_ADDRESS: Record<number, WalletAddress> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",       // Ethereum mainnet
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",     // Base mainnet
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia testnet
};

export const USDC_DECIMALS = 6;

export const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

/** Prefix used in calldata to encode notes on public payments */
export const NOTE_PREFIX = "NOTE:";

/** Prefix used in calldata to encode on-chain reactions */
export const REACTION_PREFIX = "REACT:";

/** Default chain for public transactions */
export const DEFAULT_CHAIN_ID = 8453; // Base
