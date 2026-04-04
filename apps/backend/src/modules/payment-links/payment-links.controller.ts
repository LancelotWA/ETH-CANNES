import { Controller } from "@nestjs/common";

import { PaymentLinksService } from "./payment-links.service";

@Controller("payment-links")
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}
}
