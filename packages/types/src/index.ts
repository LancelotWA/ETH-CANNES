export type WalletAddress = `0x${string}`;
export type HexHash = `0x${string}`;
export type PaymentMode = "PUBLIC" | "PRIVATE";
export type QrCodeType = "ONE_TIME" | "PERMANENT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type TransactionSource = "ONCHAIN" | "UNLINK";

// ─── User ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  walletAddress: WalletAddress;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type UserSummary = Pick<UserProfile, "displayName" | "avatarUrl">;

// ─── Transactions ───────────────────────────────────────────────────────────

export interface TransactionRecord {
  id: string;
  senderUserId: string;
  /** null when mode is PRIVATE – recipient identity is hidden */
  recipientUserId: string | null;
  amount: number;
  tokenSymbol: string;
  note: string | null;
  mode: PaymentMode;
  status: TransactionStatus;
  txHash: string | null;
  createdAt: string;
  reactions?: ReactionRecord[];
  likeCount?: number;
  sender?: UserSummary;
  recipient?: UserSummary | null;
}

export interface PublicTransaction {
  id: string;
  source: "ONCHAIN";
  mode: "PUBLIC";
  txHash: HexHash;
  blockNumber: bigint | null;
  from: WalletAddress;
  to: WalletAddress;
  amount: number;
  tokenSymbol: string;
  tokenAddress: WalletAddress | null;
  note: string | null;
  createdAt: string;
  status: TransactionStatus;
}

export interface PrivateTransaction {
  id: string;
  source: "UNLINK";
  mode: "PRIVATE";
  unlinkId: string;
  amount: number;
  tokenSymbol: string;
  note: string | null;
  createdAt: string;
  status: TransactionStatus;
  /** Optional settlement hash when private payment is later anchored on-chain */
  txHash: HexHash | null;
}

export interface UnifiedTransaction {
  id: string;
  source: TransactionSource;
  mode: PaymentMode;
  amount: number;
  tokenSymbol: string;
  note: string | null;
  txHash: HexHash | null;
  createdAt: string;
  status: TransactionStatus;
  sender: UserSummary | null;
  recipient: UserSummary | null;
  senderAddress: WalletAddress | null;
  recipientAddress: WalletAddress | null;
  unlinkId?: string;
  blockNumber?: bigint | null;
}

export interface ReactionRecord {
  id: string;
  transactionId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

// ─── Public Transaction History ─────────────────────────────────────────────

export interface PublicTransferRecord {
  from: WalletAddress;
  to: WalletAddress;
  amount: number;
  note: string | null;
  timestamp: string;
  txHash: HexHash;
}

export interface OnChainReaction {
  emoji: string;
  from: WalletAddress;
  amount: number;
  txHash: HexHash;
  targetTxHash: HexHash;
  timestamp: string;
}

// ─── Feed ───────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  amount: number;
  tokenSymbol: string;
  note: string | null;
  txHash: string | null;
  createdAt: string;
  likeCount: number;
  reactions: ReactionRecord[];
  sender: UserSummary;
  recipient: UserSummary;
}

// ─── QR Codes ───────────────────────────────────────────────────────────────

export interface QrCodeRecord {
  id: string;
  ownerId: string;
  type: QrCodeType;
  /** null means open amount (payer decides) */
  amount: number | null;
  tokenSymbol: string;
  mode: PaymentMode;
  used: boolean;
  expiresAt: string | null;
  createdAt: string;
}

// ─── Payment Links ───────────────────────────────────────────────────────────

export interface PaymentLinkRecord {
  id: string;
  ownerId: string;
  /** URL-safe alias, e.g. "alice" → pay.app/alice/20 */
  alias: string;
  /** null means open amount */
  amount: number | null;
  tokenSymbol: string;
  mode: PaymentMode;
  createdAt: string;
}

// ─── Contacts ───────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  /** The user who owns this contact entry */
  userId: string;
  /** null when isGhost = true (private payment, no on-chain link) */
  contactUserId: string | null;
  /** Human-readable label shown in the app */
  alias: string;
  /**
   * Ghost contacts are created automatically during private payments.
   * They exist only in the owner's app – there is no public on-chain link.
   */
  isGhost: boolean;
  createdAt: string;
  profile?: UserSummary | null;
}

// ─── Unilink (Unlink SDK integration) ───────────────────────────────────────

/** Unlink transaction status as returned by the SDK */
export type UnlinkTxStatus = "pending" | "relayed" | "processed" | "failed";

/** Unlink transaction type */
export type UnlinkTxType = "deposit" | "transfer" | "withdraw" | "execute";

/** Result returned after any Unlink operation (deposit, transfer, withdraw) */
export interface UnlinkOperationResult {
  txId: string;
  status: UnlinkTxStatus;
}

/** Unlink account info stored per user */
export interface UnlinkAccount {
  /** Bech32m Unlink address, e.g. "unlink1abc..." */
  unlinkAddress: string;
  /** Whether the account has been registered on the Unlink pool */
  registered: boolean;
}

/** Token balance inside the Unlink privacy pool */
export interface UnlinkBalance {
  token: WalletAddress;
  tokenSymbol: string;
  /** Amount in wei (string to preserve precision) */
  amount: string;
}

/** Payload sent by frontend to initiate a private transfer */
export interface UnlinkTransferPayload {
  senderUserId: string;
  recipientUserId: string;
  token: WalletAddress;
  amount: string;
  tokenSymbol: string;
}

/** Payload sent by frontend to deposit into the privacy pool */
export interface UnlinkDepositPayload {
  userId: string;
  token: WalletAddress;
  amount: string;
}

/** Payload sent by frontend to withdraw from the privacy pool */
export interface UnlinkWithdrawPayload {
  userId: string;
  recipientEvmAddress: WalletAddress;
  token: WalletAddress;
  amount: string;
}

// ─── Unilink Constants ──────────────────────────────────────────────────────

/** Base Sepolia test token (faucet) */
export const UNLINK_TEST_TOKEN: WalletAddress = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7";

/** Unlink privacy pool address on Base Sepolia */
export const UNLINK_POOL_ADDRESS: WalletAddress = "0x647f9b99af97e4b79DD9Dd6de3b583236352f482";

/** Base Sepolia chain ID */
export const UNLINK_CHAIN_ID = 84532;

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface VerifyWalletPayload {
  walletAddress: WalletAddress;
  nonce: string;
  signature: string;
}

export interface AuthNonceResponse {
  nonce: string;
  message: string;
}

export interface VerifyWalletResponse {
  jwt: string;
}
