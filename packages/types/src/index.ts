export type WalletAddress = `0x${string}`;

export interface UserProfile {
  id: string;
  walletAddress: WalletAddress;
  ensName: string | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  amount: number;
  tokenSymbol: string;
  note: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
  txHash: string | null;
  createdAt: string;
}

export interface VerifyWalletPayload {
  walletAddress: WalletAddress;
  message: string;
  signature: string;
}
