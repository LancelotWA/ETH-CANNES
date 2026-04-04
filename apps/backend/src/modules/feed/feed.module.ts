import { Module } from "@nestjs/common";

import { PaymentsModule } from "../payments/payments.module";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";

@Module({
  imports: [PaymentsModule],
  controllers: [FeedController],
  providers: [FeedService]
})
export class FeedModule {}
