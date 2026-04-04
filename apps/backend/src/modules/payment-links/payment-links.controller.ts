import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinksService } from "./payment-links.service";

@Controller("payment-links")
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Post()
  create(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentLinksService.create(dto);
  }

  @Get()
  listByOwner(@Query("ownerId") ownerId: string) {
    return this.paymentLinksService.listByOwner(ownerId);
  }

  /** Resolve a payment link by alias – used by the /pay/:alias page */
  @Get(":alias")
  getByAlias(@Param("alias") alias: string) {
    return this.paymentLinksService.getByAlias(alias);
  }
}
