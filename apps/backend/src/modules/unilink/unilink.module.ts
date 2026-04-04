import { Module } from "@nestjs/common";

import { UnilinkController } from "./unilink.controller";
import { UnilinkRepository } from "./unilink.repository";
import { UnilinkService } from "./unilink.service";

@Module({
  controllers: [UnilinkController],
  providers: [UnilinkRepository, UnilinkService],
  exports: [UnilinkService, UnilinkRepository],
})
export class UnilinkModule {}
