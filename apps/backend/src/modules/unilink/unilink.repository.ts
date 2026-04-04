import { Injectable } from "@nestjs/common";

interface UnlinkUserData {
  mnemonic: string;
  address: string;
}

@Injectable()
export class UnilinkRepository {
  private readonly store = new Map<string, UnlinkUserData>();

  setUnlinkAccount(userId: string, mnemonic: string, address: string) {
    this.store.set(userId, { mnemonic, address });
  }

  getUnlinkMnemonic(userId: string): string | null {
    return this.store.get(userId)?.mnemonic ?? null;
  }

  getUnlinkAddress(userId: string): string | null {
    return this.store.get(userId)?.address ?? null;
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
