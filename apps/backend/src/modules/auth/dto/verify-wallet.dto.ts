import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";

export class VerifyWalletDto {
  @IsEthereumAddress()
  walletAddress!: `0x${string}`;

  @IsString()
  @IsNotEmpty()
  nonce!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;
}
