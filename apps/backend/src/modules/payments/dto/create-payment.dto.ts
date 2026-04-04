import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from "class-validator";

export class CreatePaymentDto {
  @IsUUID()
  senderUserId!: string;

  @IsUUID()
  recipientUserId!: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  amount!: number;

  @IsString()
  @MaxLength(12)
  tokenSymbol!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
