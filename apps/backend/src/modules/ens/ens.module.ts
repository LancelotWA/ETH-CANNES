import { Module } from "@nestjs/common";

import { EnsController } from "./ens.controller";
import { EnsService } from "./ens.service";

@Module({
  controllers: [EnsController],
  providers: [EnsService],
  exports: [EnsService]
})
export class EnsModule {}
