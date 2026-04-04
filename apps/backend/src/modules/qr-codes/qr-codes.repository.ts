import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class QrCodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    ownerId: string;
    type: "ONE_TIME" | "PERMANENT";
    amount?: number;
    tokenSymbol: string;
    mode: "PUBLIC" | "PRIVATE";
    expiresAt?: Date;
  }) {
    return this.prisma.qrCode.create({ data: { ...data, amount: data.amount ?? null } });
  }

  findById(id: string) {
    return this.prisma.qrCode.findUnique({ where: { id } });
  }

  listByOwner(ownerId: string) {
    return this.prisma.qrCode.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
  }

  markUsed(id: string) {
    return this.prisma.qrCode.update({ where: { id }, data: { used: true } });
  }
}
