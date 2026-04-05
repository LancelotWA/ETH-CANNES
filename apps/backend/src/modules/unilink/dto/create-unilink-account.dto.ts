import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUnilinkAccountDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  mnemonic?: string;
}
