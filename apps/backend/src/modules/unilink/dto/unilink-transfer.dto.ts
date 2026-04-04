import { IsUUID, IsString, Matches, MaxLength } from "class-validator";

export class UnilinkTransferDto {
  @IsUUID()
  senderUserId!: string;

  @IsUUID()
  recipientUserId!: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: "token must be a valid EVM address" })
  token!: string;

  @IsString()
  @Matches(/^\d+$/, { message: "amount must be a numeric string (wei)" })
  amount!: string;

  @IsString()
  @MaxLength(12)
  tokenSymbol!: string;
}
