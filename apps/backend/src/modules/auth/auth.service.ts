import { Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyMessage } from "viem";

import { UsersService } from "../users/users.service";
import { VerifyWalletDto } from "./dto/verify-wallet.dto";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async verifyWalletSignature(payload: VerifyWalletDto) {
    const isValid = await verifyMessage({
      address: payload.walletAddress as `0x${string}`,
      message: payload.message,
      signature: payload.signature as `0x${string}`
    });

    if (!isValid) {
      throw new UnauthorizedException("Signature verification failed");
    }

    const user = await this.usersService.findOrCreateByWallet(payload.walletAddress);

    return {
      authenticated: true,
      user
    };
  }
}
