import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";
import { QrCodesController } from "./qr-codes.controller";
import { QrCodesRepository } from "./qr-codes.repository";
import { QrCodesService } from "./qr-codes.service";

@Module({
  imports: [PrismaModule],
  controllers: [QrCodesController],
  providers: [QrCodesService, QrCodesRepository]
})
export class QrCodesModule {}
