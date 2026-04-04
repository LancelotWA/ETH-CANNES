import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateContactDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  contactUserId?: string;

  @IsString()
  @MaxLength(80)
  alias!: string;

  @IsBoolean()
  isGhost!: boolean;
}
