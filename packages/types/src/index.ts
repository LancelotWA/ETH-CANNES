export type WalletAddress = `0x${string}`;
export type PaymentMode = "PUBLIC" | "PRIVATE";
export type QrCodeType = "ONE_TIME" | "PERMANENT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

// ─── User ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  walletAddress: WalletAddress;
  ensName: string | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type UserSummary = Pick<UserProfile, "displayName" | "ensName" | "avatarUrl">;

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

export interface ReactionRecord {
  id: string;
  transactionId: string;
  userId: string;
  emoji: string;
  createdAt: string;
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

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface VerifyWalletPayload {
  walletAddress: WalletAddress;
  message: string;
  signature: string;
}
