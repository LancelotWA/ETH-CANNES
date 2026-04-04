import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { AuthService } from "./auth.service";
import { VerifyWalletDto } from "./dto/verify-wallet.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  getNonce(@Query("address") address: string) {
    const nonce = this.authService.generateNonce(address);
    return { nonce, message: `Log in with nonce: ${nonce}` };
  }

  @Post("verify")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyWallet(@Body() payload: VerifyWalletDto) {
    return this.authService.verifyWalletSignature(payload);
  }
}
