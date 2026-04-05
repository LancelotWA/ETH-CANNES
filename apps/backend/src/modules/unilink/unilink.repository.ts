import { Injectable } from "@nestjs/common";

interface UnlinkUserData {
  mnemonic: string;
  address: string;
  evmAddress: string;
}

@Injectable()
export class UnilinkRepository {
  private readonly store = new Map<string, UnlinkUserData>();

  setUnlinkAccount(userId: string, mnemonic: string, address: string, evmAddress: string) {
    this.store.set(userId, { mnemonic, address, evmAddress });
  }

  getUnlinkMnemonic(userId: string): string | null {
    return this.store.get(userId)?.mnemonic ?? null;
  }

  getUnlinkAddress(userId: string): string | null {
    return this.store.get(userId)?.address ?? null;
  }

  getEvmAddress(userId: string): string | null {
    return this.store.get(userId)?.evmAddress ?? null;
  }

  findUserByUnlinkAddress(address: string) {
    for (const [userId, data] of this.store) {
      if (data.address === address) {
        return { id: userId, unlinkAddress: data.address };
      }
    }
    return null;
  }
}
