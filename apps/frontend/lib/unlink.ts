import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { api } from "@/lib/api";

export interface HandleContinueResult {
  unlinkAddress: string;
  mnemonic: string;
}

/**
 * Basic sanity check: 12 words, no empty entries.
 */
function validateMnemonicFormat(mnemonic: string): boolean {
  const words = mnemonic.split(/\s+/).filter(Boolean);
  return words.length === 12 && words.every((w) => /^[a-z]+$/.test(w));
}

/**
 * Validate or generate a mnemonic, then register the Unlink account
 * via the backend (POST /unilink/account). The SDK runs server-side only.
 */
export async function handleContinue(
  userId: string,
  authToken: string | undefined,
  mnemonic?: string,
): Promise<HandleContinueResult> {
  let finalMnemonic: string;

  if (mnemonic) {
    const trimmed = mnemonic.trim().toLowerCase();
    if (!validateMnemonicFormat(trimmed)) {
      throw new Error(
        "Invalid recovery phrase. Please enter exactly 12 words.",
      );
    }
    finalMnemonic = trimmed;
  } else {
    finalMnemonic = generateMnemonic(wordlist, 128);
  }

  const result = await api.post<{ unlinkAddress: string; registered: boolean }>(
    "/unilink/account",
    { userId, mnemonic: finalMnemonic },
    authToken,
  );

  return { unlinkAddress: result.unlinkAddress, mnemonic: finalMnemonic };
}
