import { Controller, Get, Param } from "@nestjs/common";

import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get("user/:userId")
  listForUser(@Param("userId") userId: string) {
    return this.transactionsService.listByUser(userId);
  }
}
