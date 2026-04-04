import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class PaymentLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    ownerId: string;
    alias: string;
    amount?: number;
    tokenSymbol: string;
    mode: "PUBLIC" | "PRIVATE";
  }) {
    return this.prisma.paymentLink.create({ data: { ...data, amount: data.amount ?? null } });
  }

  findByAlias(alias: string) {
    return this.prisma.paymentLink.findUnique({
      where: { alias },
      include: { owner: { select: { displayName: true, ensName: true, avatarUrl: true } } }
    });
  }

  listByOwner(ownerId: string) {
    return this.prisma.paymentLink.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
  }

  deleteById(id: string) {
    return this.prisma.paymentLink.delete({ where: { id } });
  }
}
