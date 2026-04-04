import { Body, Controller, Param, Patch, Post } from "@nestjs/common";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(@Body() payload: CreatePaymentDto) {
    return this.paymentsService.createPayment(payload);
  }

  @Patch(":id/settle")
  settlePayment(@Param("id") id: string, @Body() body: { txHash: string }) {
    return this.paymentsService.settlePayment(id, body.txHash);
  }
}
