import { IsEthereumAddress, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsEthereumAddress()
  walletAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ensName?: string;

  @IsString()
  @MaxLength(50)
  displayName!: string;
}
