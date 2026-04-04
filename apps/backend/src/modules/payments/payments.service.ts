import { BadRequestException, Injectable } from "@nestjs/common";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsRepository } from "./payments.repository";

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async createPayment(payload: CreatePaymentDto) {
    if (payload.mode === "PUBLIC" && !payload.recipientUserId) {
      throw new BadRequestException("recipientUserId is required for PUBLIC payments");
    }

    if (payload.recipientUserId && payload.senderUserId === payload.recipientUserId) {
      throw new BadRequestException("Sender and recipient cannot be the same");
    }

    return this.paymentsRepository.createTransaction({
      senderUserId: payload.senderUserId,
      recipientUserId: payload.recipientUserId,
      amount: payload.amount,
      tokenSymbol: payload.tokenSymbol,
      mode: payload.mode,
      note: payload.note
    });
  }

  async settlePayment(transactionId: string, txHash: string) {
    return this.paymentsRepository.markCompleted(transactionId, txHash);
  }
}
