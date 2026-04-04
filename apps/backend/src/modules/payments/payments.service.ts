import { BadRequestException, Injectable } from "@nestjs/common";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsRepository } from "./payments.repository";

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async createPayment(payload: CreatePaymentDto) {
    if (payload.senderUserId === payload.recipientUserId) {
      throw new BadRequestException("Sender and recipient cannot be the same");
    }

    return this.paymentsRepository.createTransaction(payload);
  }

  async settlePayment(transactionId: string, txHash: string) {
    return this.paymentsRepository.markCompleted(transactionId, txHash);
  }
}
