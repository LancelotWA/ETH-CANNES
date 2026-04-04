import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTransaction(data: {
    senderUserId: string;
    recipientUserId?: string;
    amount: number;
    tokenSymbol: string;
    mode: "PUBLIC" | "PRIVATE";
    note?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        senderUserId: data.senderUserId,
        recipientUserId: data.recipientUserId ?? null,
        amount: data.amount,
        tokenSymbol: data.tokenSymbol,
        mode: data.mode,
        note: data.note,
        status: "PENDING"
      }
    });
  }

  markCompleted(transactionId: string, txHash: string) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "COMPLETED", txHash }
    });
  }

  listByUserId(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ senderUserId: userId }, { recipientUserId: userId }]
      },
      orderBy: { createdAt: "desc" }
    });
  }

  listPublicFeed(limit = 50) {
    return this.prisma.transaction.findMany({
      where: { mode: "PUBLIC", status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: { select: { displayName: true, ensName: true, avatarUrl: true } },
        recipient: { select: { displayName: true, ensName: true, avatarUrl: true } },
        reactions: true
      }
    });
  }
}
