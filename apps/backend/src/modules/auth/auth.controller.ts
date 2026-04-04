import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { AuthService } from "./auth.service";
import { VerifyWalletDto } from "./dto/verify-wallet.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("wallet/verify")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyWallet(@Body() payload: VerifyWalletDto) {
    return this.authService.verifyWalletSignature(payload);
  }
}
