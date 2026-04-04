import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createUnlink, unlinkAccount, unlinkEvm } from "@unlink-xyz/sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";
import { generateMnemonic } from "viem/accounts";
import { english } from "viem/accounts";

import { UnilinkRepository } from "./unilink.repository";

import type { UnlinkOperationResult } from "@ethcannes/types";

@Injectable()
export class UnilinkService {
  private readonly apiKey: string;
  private readonly engineUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly repository: UnilinkRepository,
  ) {
    this.apiKey = this.config.get<string>("unlink.apiKey", "");
    this.engineUrl = this.config.get<string>("unlink.apiUrl", "https://staging-api.unlink.xyz");
  }

  /**
   * Instantiate an Unlink SDK client for a given user mnemonic.
   * Called per-request — not persisted in memory.
   */
  private createClient(mnemonic: string) {
    const viemAccount = mnemonicToAccount(mnemonic);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account: viemAccount,
      chain: baseSepolia,
      transport: http(),
    });

    return createUnlink({
      engineUrl: this.engineUrl,
      apiKey: this.apiKey,
      account: unlinkAccount.fromMnemonic({ mnemonic }),
      evm: unlinkEvm.fromViem({ walletClient, publicClient }),
    });
  }

  /**
   * Generate a BIP39-compatible mnemonic (12 words).
   */
  private createMnemonic(): string {
    return generateMnemonic(english);
  }

  /**
   * Create or retrieve the Unlink account for a user.
   * Generates a mnemonic if the user doesn't have one yet.
   */
  async getOrCreateAccount(userId: string): Promise<{ unlinkAddress: string; registered: boolean }> {
    const existingAddress = await this.repository.getUnlinkAddress(userId);
    if (existingAddress) {
      return { unlinkAddress: existingAddress, registered: true };
    }

    const mnemonic = this.createMnemonic();
    const client = this.createClient(mnemonic);

    await client.ensureRegistered();
    const unlinkAddress = await client.getAddress();

    await this.repository.setUnlinkAccount(userId, mnemonic, unlinkAddress);

    return { unlinkAddress, registered: true };
  }

  /**
   * Get the Unlink address for a user. Throws if not found.
   */
  async getAddress(userId: string): Promise<string> {
    const address = await this.repository.getUnlinkAddress(userId);
    if (!address) {
      throw new NotFoundException(`User ${userId} has no Unlink account`);
    }
    return address;
  }

  /**
   * Helper: build a client from a userId by fetching the mnemonic from DB.
   */
  private async clientForUser(userId: string) {
    const mnemonic = await this.repository.getUnlinkMnemonic(userId);
    if (!mnemonic) {
      throw new NotFoundException(`User ${userId} has no Unlink account`);
    }
    return this.createClient(mnemonic);
  }

  /**
   * Get private balances for a user inside the Unlink pool.
   */
  async getBalances(userId: string) {
    const client = await this.clientForUser(userId);
    return client.getBalances();
  }

  /**
   * Deposit ERC-20 tokens from the user's EVM wallet into the privacy pool.
   * This is an on-chain operation (visible: amount + sender + token).
   */
  async deposit(userId: string, token: string, amount: string): Promise<UnlinkOperationResult> {
    const client = await this.clientForUser(userId);

    await client.ensureErc20Approval({ token, amount });
    const { txId, status } = await client.deposit({ token, amount });
    const confirmed = await client.pollTransactionStatus(txId);

    return { txId, status: confirmed.status as UnlinkOperationResult["status"] };
  }

  /**
   * Private transfer between two Unlink accounts inside the pool.
   * Fully hidden on-chain: amount, sender, recipient, token — all invisible.
   */
  async transfer(
    senderUserId: string,
    recipientUserId: string,
    token: string,
    amount: string,
  ): Promise<UnlinkOperationResult> {
    if (senderUserId === recipientUserId) {
      throw new BadRequestException("Cannot transfer to yourself");
    }

    const recipientAddress = await this.repository.getUnlinkAddress(recipientUserId);
    if (!recipientAddress) {
      throw new NotFoundException(`Recipient ${recipientUserId} has no Unlink account`);
    }

    const client = await this.clientForUser(senderUserId);
    const { txId } = await client.transfer({ recipientAddress, token, amount });
    const confirmed = await client.pollTransactionStatus(txId);

    return { txId, status: confirmed.status as UnlinkOperationResult["status"] };
  }

  /**
   * Withdraw tokens from the privacy pool to any EVM address.
   * On-chain visible: amount + recipient + token (sender hidden).
   */
  async withdraw(
    userId: string,
    recipientEvmAddress: string,
    token: string,
    amount: string,
  ): Promise<UnlinkOperationResult> {
    const client = await this.clientForUser(userId);
    const { txId } = await client.withdraw({ recipientEvmAddress, token, amount });
    const confirmed = await client.pollTransactionStatus(txId);

    return { txId, status: confirmed.status as UnlinkOperationResult["status"] };
  }

  /**
   * Get Unlink transaction history for a user.
   */
  async getTransactions(userId: string, type?: string, limit?: number) {
    const client = await this.clientForUser(userId);
    return client.getTransactions({
      type: type as any,
      limit,
    });
  }
}
