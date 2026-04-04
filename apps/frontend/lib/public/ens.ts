import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import type { WalletAddress } from "@ethcannes/types";

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL_MAINNET),
});

export async function resolveEns(name: string): Promise<WalletAddress | null> {
  try {
    const address = await ensClient.getEnsAddress({ name });
    return (address as WalletAddress) ?? null;
  } catch {
    return null;
  }
}

export async function lookupAddress(address: WalletAddress): Promise<string | null> {
  try {
    return await ensClient.getEnsName({ address });
  } catch {
    return null;
  }
}

/** Batch-resolve a set of addresses to ENS names. Returns a map address → name|null. */
export async function batchLookup(
  addresses: WalletAddress[]
): Promise<Map<WalletAddress, string | null>> {
  const unique = [...new Set(addresses)];
  const results = await Promise.allSettled(
    unique.map((addr) => lookupAddress(addr))
  );
  const map = new Map<WalletAddress, string | null>();
  unique.forEach((addr, i) => {
    const r = results[i];
    map.set(addr, r.status === "fulfilled" ? r.value : null);
  });
  return map;
}
