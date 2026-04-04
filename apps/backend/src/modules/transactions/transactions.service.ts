import { Injectable } from "@nestjs/common";

import { PaymentsRepository } from "../payments/payments.repository";

@Injectable()
export class TransactionsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  listByUser(userId: string) {
    return this.paymentsRepository.listByUserId(userId);
  }
}
