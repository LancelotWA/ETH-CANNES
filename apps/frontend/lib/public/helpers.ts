import { USDC_DECIMALS } from "./constants";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUSDC(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Convert human-readable amount (e.g. "5.25") to USDC smallest unit (bigint) */
export function parseUSDC(amount: string): bigint {
  const [whole = "0", frac = ""] = amount.split(".");
  const paddedFrac = frac.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(whole + paddedFrac);
}

/** Convert USDC smallest unit (bigint) to human-readable number */
export function fromUSDC(raw: bigint): number {
  const divisor = 10 ** USDC_DECIMALS;
  return Number(raw) / divisor;
}

/** Encode a note string into hex bytes for calldata */
export function encodeNote(note: string): `0x${string}` {
  const bytes = new TextEncoder().encode(note);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

/** Decode hex bytes from calldata back into a note string */
export function decodeNote(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length === 0) return "";
  const bytes = new Uint8Array(
    clean.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  return new TextDecoder().decode(bytes);
}
