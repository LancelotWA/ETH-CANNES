import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinksRepository } from "./payment-links.repository";

@Injectable()
export class PaymentLinksService {
  constructor(private readonly paymentLinksRepository: PaymentLinksRepository) {}

  async create(dto: CreatePaymentLinkDto) {
    const existing = await this.paymentLinksRepository.findByAlias(dto.alias);
    if (existing) throw new ConflictException(`Alias "${dto.alias}" is already taken`);
    return this.paymentLinksRepository.create({
      ownerId: dto.ownerId,
      alias: dto.alias,
      amount: dto.amount,
      tokenSymbol: dto.tokenSymbol,
      mode: dto.mode
    });
  }

  async getByAlias(alias: string) {
    const link = await this.paymentLinksRepository.findByAlias(alias);
    if (!link) throw new NotFoundException(`Payment link "${alias}" not found`);
    return link;
  }

  listByOwner(ownerId: string) {
    return this.paymentLinksRepository.listByOwner(ownerId);
  }
}
