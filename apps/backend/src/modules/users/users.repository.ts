import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { walletAddress: string; displayName: string; ensName?: string }) {
    return this.prisma.user.create({
      data: {
        walletAddress: data.walletAddress.toLowerCase(),
        displayName: data.displayName,
        ensName: data.ensName
      }
    });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.user.findMany({ where: { id: { in: ids } } });
  }
}
