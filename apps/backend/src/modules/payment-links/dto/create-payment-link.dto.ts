import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Matches, MaxLength } from "class-validator";

export class CreatePaymentLinkDto {
  @IsUUID()
  ownerId!: string;

  /** URL-safe slug, e.g. "alice" or "alice-tips" */
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "alias must be lowercase alphanumeric with hyphens" })
  @MaxLength(40)
  alias!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  amount?: number;

  @IsString()
  @MaxLength(12)
  tokenSymbol: string = "USDC";

  @IsEnum(["PUBLIC", "PRIVATE"])
  mode!: "PUBLIC" | "PRIVATE";
}
