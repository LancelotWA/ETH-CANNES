export type WalletAddress = `0x${string}`;
export type HexHash = `0x${string}`;
export type PaymentMode = "PUBLIC" | "PRIVATE";
export type QrCodeType = "ONE_TIME" | "PERMANENT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type TransactionSource = "ONCHAIN" | "UNLINK";
export interface UserProfile {
    id: string;
    walletAddress: WalletAddress;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
}
export type UserSummary = Pick<UserProfile, "displayName" | "avatarUrl">;
export interface TransactionRecord {
    id: string;
    senderUserId: string;
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
export interface QrCodeRecord {
    id: string;
    ownerId: string;
    type: QrCodeType;
    amount: number | null;
    tokenSymbol: string;
    mode: PaymentMode;
    used: boolean;
    expiresAt: string | null;
    createdAt: string;
}
export interface PaymentLinkRecord {
    id: string;
    ownerId: string;
    alias: string;
    amount: number | null;
    tokenSymbol: string;
    mode: PaymentMode;
    createdAt: string;
}
export interface Contact {
    id: string;
    userId: string;
    contactUserId: string | null;
    alias: string;
    isGhost: boolean;
    createdAt: string;
    profile?: UserSummary | null;
}
export type UnlinkTxStatus = "pending" | "relayed" | "processed" | "failed";
export type UnlinkTxType = "deposit" | "transfer" | "withdraw" | "execute";
export interface UnlinkOperationResult {
    txId: string;
    status: UnlinkTxStatus;
}
export interface UnlinkAccount {
    unlinkAddress: string;
    registered: boolean;
}
export interface UnlinkBalance {
    token: WalletAddress;
    tokenSymbol: string;
    amount: string;
}
export interface UnlinkTransferPayload {
    senderUserId: string;
    recipientUserId: string;
    token: WalletAddress;
    amount: string;
    tokenSymbol: string;
}
export interface UnlinkDepositPayload {
    userId: string;
    token: WalletAddress;
    amount: string;
}
export interface UnlinkWithdrawPayload {
    userId: string;
    recipientEvmAddress: WalletAddress;
    token: WalletAddress;
    amount: string;
}
export declare const UNLINK_TEST_TOKEN: WalletAddress;
export declare const UNLINK_POOL_ADDRESS: WalletAddress;
export declare const UNLINK_CHAIN_ID = 84532;
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
