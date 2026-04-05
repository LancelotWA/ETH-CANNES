import { IsString, Matches } from "class-validator";

export class UnilinkTransferDto {
  @IsString()
  senderUserId!: string;

  @IsString()
  @Matches(/^unlink1[a-z0-9]{10,}$/, { message: "recipientUnlinkAddress must be a valid Unlink address (bech32m starting with unlink1)" })
  recipientUnlinkAddress!: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: "token must be a valid EVM address" })
  token!: string;

  @IsString()
  @Matches(/^\d+$/, { message: "amount must be a numeric string (wei)" })
  amount!: string;
}
