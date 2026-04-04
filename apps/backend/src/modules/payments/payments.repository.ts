import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTransaction(data: {
    senderUserId: string;
    recipientUserId: string;
    amount: number;
    tokenSymbol: string;
    note?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        senderUserId: data.senderUserId,
        recipientUserId: data.recipientUserId,
        amount: data.amount,
        tokenSymbol: data.tokenSymbol,
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
}
