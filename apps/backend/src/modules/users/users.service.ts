import { Injectable, NotFoundException } from "@nestjs/common";

import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findOrCreateByWallet(walletAddress: string) {
    const existingUser = await this.usersRepository.findByWallet(walletAddress);
    if (existingUser) return existingUser;

    const compact = walletAddress.slice(0, 6);
    return this.usersRepository.create({
      walletAddress,
      displayName: `user-${compact}`
    });
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
