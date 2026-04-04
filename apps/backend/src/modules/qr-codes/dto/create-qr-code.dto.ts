import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateQrCodeDto {
  @IsUUID()
  ownerId!: string;

  @IsEnum(["ONE_TIME", "PERMANENT"])
  type!: "ONE_TIME" | "PERMANENT";

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  amount?: number;

  @IsString()
  @MaxLength(12)
  tokenSymbol: string = "USDC";

  @IsEnum(["PUBLIC", "PRIVATE"])
  mode!: "PUBLIC" | "PRIVATE";

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
