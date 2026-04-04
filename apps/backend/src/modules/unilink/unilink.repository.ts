import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UnilinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  setUnlinkAccount(
    userId: string,
    mnemonic: string,
    address: string,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { unlinkMnemonic: mnemonic, unlinkAddress: address },
    });
  }

  async getUnlinkMnemonic(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { unlinkMnemonic: true },
    });
    return user?.unlinkMnemonic ?? null;
  }

  async getUnlinkAddress(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { unlinkAddress: true },
    });
    return user?.unlinkAddress ?? null;
  }

  findUserByUnlinkAddress(address: string) {
    return this.prisma.user.findUnique({
      where: { unlinkAddress: address },
    });
  }
}
