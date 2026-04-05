import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

import { CreateUnilinkAccountDto } from "./dto/create-unilink-account.dto";
import { UnilinkDepositDto } from "./dto/unilink-deposit.dto";
import { UnilinkTransferDto } from "./dto/unilink-transfer.dto";
import { UnilinkWithdrawDto } from "./dto/unilink-withdraw.dto";
import { UnilinkService } from "./unilink.service";

@Controller("unilink")
export class UnilinkController {
  constructor(private readonly unlinkService: UnilinkService) {}

  @Post("account")
  createAccount(@Body() dto: CreateUnilinkAccountDto) {
    return this.unlinkService.getOrCreateAccount(dto.userId, dto.mnemonic);
  }

  @Get("evm-address/:userId")
  getEvmAddress(@Param("userId") userId: string) {
    return this.unlinkService.getEvmAddress(userId);
  }

  @Get("balance/:userId")
  getBalance(@Param("userId") userId: string) {
    return this.unlinkService.getBalances(userId);
  }

  @Post("deposit")
  deposit(@Body() dto: UnilinkDepositDto) {
    return this.unlinkService.deposit(dto.userId, dto.token, dto.amount);
  }

  @Post("transfer")
  transfer(@Body() dto: UnilinkTransferDto) {
    console.log("[transfer] received body:", JSON.stringify(dto));
    return this.unlinkService.transfer(
      dto.senderUserId,
      dto.recipientUnlinkAddress,
      dto.token,
      dto.amount,
    );
  }

  @Post("withdraw")
  withdraw(@Body() dto: UnilinkWithdrawDto) {
    return this.unlinkService.withdraw(
      dto.userId,
      dto.recipientEvmAddress,
      dto.token,
      dto.amount,
    );
  }

  @Get("transactions/:userId")
  getTransactions(
    @Param("userId") userId: string,
    @Query("type") type?: string,
    @Query("limit") limit?: string,
  ) {
    return this.unlinkService.getTransactions(
      userId,
      type,
      limit ? Number(limit) : undefined,
    );
  }
}
