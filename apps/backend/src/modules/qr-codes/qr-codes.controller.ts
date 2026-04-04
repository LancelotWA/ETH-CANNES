import { Controller } from "@nestjs/common";

import { QrCodesService } from "./qr-codes.service";

@Controller("qr-codes")
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}
}
