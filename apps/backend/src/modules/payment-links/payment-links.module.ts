import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";
import { PaymentLinksController } from "./payment-links.controller";
import { PaymentLinksRepository } from "./payment-links.repository";
import { PaymentLinksService } from "./payment-links.service";

@Module({
  imports: [PrismaModule],
  controllers: [PaymentLinksController],
  providers: [PaymentLinksService, PaymentLinksRepository]
})
export class PaymentLinksModule {}
