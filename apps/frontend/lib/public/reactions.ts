import {
  createWalletClient,
  custom,
  encodeFunctionData,
  parseAbi,
} from "viem";
import { base, mainnet, sepolia } from "viem/chains";
import type { HexHash, WalletAddress } from "@ethcannes/types";
import { DEFAULT_CHAIN_ID, REACTION_PREFIX, USDC_ADDRESS } from "./constants";

const CHAINS_BY_ID = {
  1: mainnet,
  8453: base,
  11155111: sepolia,
} as const;

const transferAbi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

/** Micro-transaction amount for reactions: 0.01 USDC */
const REACTION_AMOUNT = 10_000n; // 0.01 * 10^6

export interface SendReactionParams {
  /** Address of the original payment sender (reaction recipient) */
  to: WalletAddress;
  emoji: string;
  /** Tx hash of the transaction being reacted to */
  targetTxHash: HexHash;
  chainId?: number;
}

export interface SendReactionResult {
  txHash: HexHash;
}

/**
 * Send an on-chain reaction as a micro USDC transfer (0.01 USDC).
 * The calldata encodes: "REACT:<emoji>:<targetTxHash>"
 */
export async function sendReaction({
  to,
  emoji,
  targetTxHash,
  chainId = DEFAULT_CHAIN_ID,
}: SendReactionParams): Promise<SendReactionResult> {
  if (!window.ethereum) throw new Error("No wallet found");

  const chain = CHAINS_BY_ID[chainId as keyof typeof CHAINS_BY_ID];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  const usdc = USDC_ADDRESS[chainId];
  if (!usdc) throw new Error(`USDC not configured for chain ${chainId}`);

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.requestAddresses();

  let data = encodeFunctionData({
    abi: transferAbi,
    functionName: "transfer",
    args: [to, REACTION_AMOUNT],
  });

  // Append reaction payload
  const reactionPayload = `${REACTION_PREFIX}${emoji}:${targetTxHash}`;
  const hex = Array.from(new TextEncoder().encode(reactionPayload))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  data = `${data}${hex}` as `0x${string}`;

  const txHash = await walletClient.sendTransaction({
    account,
    to: usdc,
    data,
    value: 0n,
  });

  return { txHash };
}
