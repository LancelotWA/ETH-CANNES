import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { CreateQrCodeDto } from "./dto/create-qr-code.dto";
import { QrCodesRepository } from "./qr-codes.repository";

@Injectable()
export class QrCodesService {
  constructor(private readonly qrCodesRepository: QrCodesRepository) {}

  create(dto: CreateQrCodeDto) {
    return this.qrCodesRepository.create({
      ownerId: dto.ownerId,
      type: dto.type,
      amount: dto.amount,
      tokenSymbol: dto.tokenSymbol,
      mode: dto.mode,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined
    });
  }

  async getById(id: string) {
    const qr = await this.qrCodesRepository.findById(id);
    if (!qr) throw new NotFoundException("QR code not found");
    return qr;
  }

  listByOwner(ownerId: string) {
    return this.qrCodesRepository.listByOwner(ownerId);
  }

  async use(id: string) {
    const qr = await this.qrCodesRepository.findById(id);
    if (!qr) throw new NotFoundException("QR code not found");
    if (qr.type === "ONE_TIME" && qr.used) {
      throw new BadRequestException("This QR code has already been used");
    }
    if (qr.expiresAt && qr.expiresAt < new Date()) {
      throw new BadRequestException("This QR code has expired");
    }
    if (qr.type === "ONE_TIME") {
      return this.qrCodesRepository.markUsed(id);
    }
    return qr;
  }
}
