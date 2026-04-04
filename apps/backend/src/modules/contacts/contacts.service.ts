import { BadRequestException, Injectable } from "@nestjs/common";

import { CreateContactDto } from "./dto/create-contact.dto";
import { ContactsRepository } from "./contacts.repository";

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  create(dto: CreateContactDto) {
    if (!dto.isGhost && !dto.contactUserId) {
      throw new BadRequestException("contactUserId is required for non-ghost contacts");
    }
    return this.contactsRepository.create({
      userId: dto.userId,
      contactUserId: dto.contactUserId,
      alias: dto.alias,
      isGhost: dto.isGhost
    });
  }

  listByUserId(userId: string) {
    return this.contactsRepository.listByUserId(userId);
  }
}
