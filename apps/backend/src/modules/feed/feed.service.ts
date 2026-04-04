import { Injectable } from "@nestjs/common";

import { PaymentsRepository } from "../payments/payments.repository";

@Injectable()
export class FeedService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  getPublicFeed(limit = 50) {
    return this.paymentsRepository.listPublicFeed(limit);
  }
}
