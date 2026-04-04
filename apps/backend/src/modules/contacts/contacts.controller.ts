import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { CreateContactDto } from "./dto/create-contact.dto";
import { ContactsService } from "./contacts.service";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get(":userId")
  listByUserId(@Param("userId") userId: string) {
    return this.contactsService.listByUserId(userId);
  }
}
