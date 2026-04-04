import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { userId: string; contactUserId?: string; alias: string; isGhost: boolean }) {
    return this.prisma.contact.create({ data: { ...data, contactUserId: data.contactUserId ?? null } });
  }

  listByUserId(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      orderBy: { alias: "asc" }
    });
  }

  findById(id: string) {
    return this.prisma.contact.findUnique({ where: { id } });
  }

  deleteById(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
