import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  http,
  parseAbi,
} from "viem";
import { base, mainnet, sepolia } from "viem/chains";
import type { HexHash, PublicTransferRecord, WalletAddress } from "@ethcannes/types";
import {
  DEFAULT_CHAIN_ID,
  NOTE_PREFIX,
  REACTION_PREFIX,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "./constants";
import { decodeNote, parseUSDC } from "./helpers";

const CHAINS_BY_ID = {
  1: mainnet,
  8453: base,
  11155111: sepolia,
} as const;

const RPC_URLS: Record<number, string | undefined> = {
  1: process.env.NEXT_PUBLIC_RPC_URL_MAINNET,
  8453: process.env.NEXT_PUBLIC_RPC_URL_BASE,
  11155111: process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA,
};

function getPublicClient(chainId: number = DEFAULT_CHAIN_ID) {
  const chain = CHAINS_BY_ID[chainId as keyof typeof CHAINS_BY_ID];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
  return createPublicClient({
    chain,
    transport: http(RPC_URLS[chainId]),
  });
}

const transferAbi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

// ─── Send Public Payment ────────────────────────────────────────────────────

export interface SendPublicPaymentParams {
  to: WalletAddress;
  /** Human-readable amount, e.g. "5.25" */
  amount: string;
  note?: string;
  chainId?: number;
}

export interface SendPublicPaymentResult {
  txHash: HexHash;
}

/**
 * Send a public USDC transfer with an optional note encoded in calldata.
 *
 * The note is appended after the standard ERC-20 transfer calldata as:
 *   <transfer calldata> + <utf8 hex of "NOTE:<note text>">
 *
 * Requires a browser wallet (window.ethereum).
 */
export async function sendPublicPayment({
  to,
  amount,
  note,
  chainId = DEFAULT_CHAIN_ID,
}: SendPublicPaymentParams): Promise<SendPublicPaymentResult> {
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

  const rawAmount = parseUSDC(amount);

  // Build ERC-20 transfer calldata
  let data = encodeFunctionData({
    abi: transferAbi,
    functionName: "transfer",
    args: [to, rawAmount],
  });

  // Append note as extra calldata bytes (ignored by ERC-20 but stored on-chain)
  if (note && note.trim().length > 0) {
    const notePayload = `${NOTE_PREFIX}${note.trim()}`;
    const noteHex = Array.from(new TextEncoder().encode(notePayload))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    data = `${data}${noteHex}` as `0x${string}`;
  }

  const txHash = await walletClient.sendTransaction({
    account,
    to: usdc,
    data,
    value: 0n,
  });

  return { txHash };
}

// ─── Get Public History ─────────────────────────────────────────────────────

interface AlchemyTransfer {
  from: string;
  to: string;
  value: number | null;
  rawContract: {
    address: string;
    value: string;
    decimal: string;
  };
  hash: string;
  metadata: {
    blockTimestamp: string;
  };
  asset: string;
  category: string;
}

interface AlchemyTransfersResponse {
  transfers: AlchemyTransfer[];
}

/**
 * Fetch public USDC transfer history for an address using Alchemy's
 * alchemy_getAssetTransfers endpoint.
 */
export async function getPublicHistory(
  address: WalletAddress,
  chainId: number = DEFAULT_CHAIN_ID
): Promise<PublicTransferRecord[]> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY not set");

  const network = process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ?? "base-mainnet";
  const url = `https://${network}.g.alchemy.com/v2/${apiKey}`;

  const usdc = USDC_ADDRESS[chainId]?.toLowerCase();
  if (!usdc) throw new Error(`USDC not configured for chain ${chainId}`);

  // Fetch both sent and received in parallel
  const [sentRes, recvRes] = await Promise.all([
    fetchTransfers(url, { fromAddress: address, contractAddresses: [usdc] }),
    fetchTransfers(url, { toAddress: address, contractAddresses: [usdc] }),
  ]);

  const all = [...sentRes.transfers, ...recvRes.transfers];

  // Deduplicate by tx hash
  const seen = new Set<string>();
  const unique = all.filter((t) => {
    if (seen.has(t.hash)) return false;
    seen.add(t.hash);
    return true;
  });

  // Fetch calldata for each tx to extract notes
  const client = getPublicClient(chainId);
  const records = await Promise.all(
    unique.map(async (t): Promise<PublicTransferRecord> => {
      let note: string | null = null;
      try {
        const tx = await client.getTransaction({ hash: t.hash as HexHash });
        note = extractNoteFromCalldata(tx.input);
      } catch {
        // calldata fetch failed — note stays null
      }

      const decimals = parseInt(t.rawContract.decimal || "6", 10);
      const rawValue = BigInt(t.rawContract.value);
      const amount = Number(rawValue) / 10 ** decimals;

      return {
        from: t.from as WalletAddress,
        to: t.to as WalletAddress,
        amount,
        note,
        timestamp: t.metadata.blockTimestamp,
        txHash: t.hash as HexHash,
      };
    })
  );

  // Sort newest first
  records.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return records;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchTransfers(
  url: string,
  params: {
    fromAddress?: string;
    toAddress?: string;
    contractAddresses: string[];
  }
): Promise<AlchemyTransfersResponse> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        ...(params.fromAddress && { fromAddress: params.fromAddress }),
        ...(params.toAddress && { toAddress: params.toAddress }),
        contractAddresses: params.contractAddresses,
        category: ["erc20"],
        withMetadata: true,
        order: "desc",
        maxCount: "0x64", // 100
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Alchemy request failed: ${res.status}`);
  const json = await res.json();
  return json.result as AlchemyTransfersResponse;
}

/**
 * Extract a note from ERC-20 calldata.
 * Standard ERC-20 transfer calldata is 68 bytes (4 selector + 32 address + 32 amount).
 * Anything after byte 68 is our appended note.
 */
function extractNoteFromCalldata(input: string): string | null {
  const clean = input.startsWith("0x") ? input.slice(2) : input;
  // 68 bytes = 136 hex chars
  if (clean.length <= 136) return null;

  const extra = clean.slice(136);
  const decoded = decodeNote(extra);

  if (decoded.startsWith(NOTE_PREFIX)) {
    return decoded.slice(NOTE_PREFIX.length);
  }
  if (decoded.startsWith(REACTION_PREFIX)) {
    return null; // reaction, not a note
  }

  return null;
}

/** Check if a tx is a reaction (vs a regular payment) */
export function isReactionTx(input: string): boolean {
  const clean = input.startsWith("0x") ? input.slice(2) : input;
  if (clean.length <= 136) return false;
  const decoded = decodeNote(clean.slice(136));
  return decoded.startsWith(REACTION_PREFIX);
}

/** Extract reaction data from calldata: { emoji, targetTxHash } */
export function parseReactionCalldata(
  input: string
): { emoji: string; targetTxHash: string } | null {
  const clean = input.startsWith("0x") ? input.slice(2) : input;
  if (clean.length <= 136) return null;

  const decoded = decodeNote(clean.slice(136));
  if (!decoded.startsWith(REACTION_PREFIX)) return null;

  // Format: "REACT:<emoji>:<targetTxHash>"
  const payload = decoded.slice(REACTION_PREFIX.length);
  const sepIdx = payload.indexOf(":");
  if (sepIdx === -1) return null;

  return {
    emoji: payload.slice(0, sepIdx),
    targetTxHash: payload.slice(sepIdx + 1),
  };
}
