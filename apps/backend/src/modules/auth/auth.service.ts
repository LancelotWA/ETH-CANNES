import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import { verifyMessage } from "viem";

import { VerifyWalletDto } from "./dto/verify-wallet.dto";

// In-memory nonce store: address → { nonce, expiresAt }
// Good enough for a hackathon — replace with Redis for production
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  generateNonce(address: string): string {
    const nonce = randomBytes(16).toString("hex");
    nonceStore.set(address.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + NONCE_TTL_MS
    });
    return nonce;
  }

  async verifyWalletSignature(payload: VerifyWalletDto): Promise<{ jwt: string }> {
    const key = payload.walletAddress.toLowerCase();
    const stored = nonceStore.get(key);

    if (!stored) {
      throw new UnauthorizedException("No nonce found — request a new one");
    }

    if (Date.now() > stored.expiresAt) {
      nonceStore.delete(key);
      throw new UnauthorizedException("Nonce expired — request a new one");
    }

    if (stored.nonce !== payload.nonce) {
      throw new UnauthorizedException("Nonce mismatch");
    }

    const message = `Log in with nonce: ${payload.nonce}`;

    const isValid = await verifyMessage({
      address: payload.walletAddress,
      message,
      signature: payload.signature as `0x${string}`
    });

    if (!isValid) {
      throw new UnauthorizedException("Signature verification failed");
    }

    // Consume nonce — one-time use
    nonceStore.delete(key);

    const jwt = this.jwtService.sign({ sub: payload.walletAddress });
    return { jwt };
  }
}
