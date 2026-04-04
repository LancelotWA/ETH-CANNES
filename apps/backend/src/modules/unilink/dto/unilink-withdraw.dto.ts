import { IsUUID, IsString, Matches } from "class-validator";

export class UnilinkWithdrawDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: "recipientEvmAddress must be a valid EVM address" })
  recipientEvmAddress!: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: "token must be a valid EVM address" })
  token!: string;

  @IsString()
  @Matches(/^\d+$/, { message: "amount must be a numeric string (wei)" })
  amount!: string;
}
