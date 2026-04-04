import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

import { CreateQrCodeDto } from "./dto/create-qr-code.dto";
import { QrCodesService } from "./qr-codes.service";

@Controller("qr-codes")
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post()
  create(@Body() dto: CreateQrCodeDto) {
    return this.qrCodesService.create(dto);
  }

  @Get()
  listByOwner(@Query("ownerId") ownerId: string) {
    return this.qrCodesService.listByOwner(ownerId);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.qrCodesService.getById(id);
  }

  /** Mark a one-time QR code as used after a payment is initiated */
  @Post(":id/use")
  use(@Param("id") id: string) {
    return this.qrCodesService.use(id);
  }
}
