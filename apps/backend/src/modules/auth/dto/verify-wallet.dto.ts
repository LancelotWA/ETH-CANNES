import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";

export class VerifyWalletDto {
  @IsEthereumAddress()
  walletAddress!: `0x${string}`;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;
}
