import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from "class-validator";

export class CreatePaymentDto {
  @IsUUID()
  senderUserId!: string;

  /**
   * Required when mode = PUBLIC.
   * Omitted (or null) when mode = PRIVATE – recipient identity stays hidden.
   */
  @IsOptional()
  @IsUUID()
  recipientUserId?: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  amount!: number;

  @IsString()
  @MaxLength(12)
  tokenSymbol!: string;

  @IsEnum(["PUBLIC", "PRIVATE"])
  mode!: "PUBLIC" | "PRIVATE";

  @IsOptional()
  @IsString()
  @MaxLength(240)
  note?: string;
}
