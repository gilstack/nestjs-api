import { Injectable } from '@nestjs/common';

// internal
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';

// relatives
import type {
  CreateAccountInput,
  CreateUserInput,
  UpdateUserInput,
  User,
} from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    return this.prisma.user.findFirst({
      where: {
        accounts: {
          some: {
            identifier: normalizedEmail,
            provider: 'EMAIL',
          },
        },
      },
      include: { accounts: true },
    });
  }

  async createWithAccount(
    userData: CreateUserInput,
    accountData: CreateAccountInput,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        username: userData.username,
        tag: userData.tag,
        role: userData.role ?? 'GUEST',
        status: userData.status ?? 'PENDING',
        name: userData.name,
        image: userData.image,
        bio: userData.bio,
        accounts: {
          create: {
            identifier: accountData.identifier.toLowerCase().trim(),
            provider: accountData.provider,
            providerId: accountData.providerId,
          },
        },
      },
      include: { accounts: true },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { accounts: true },
    });
  }

  async activate(id: string, email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();

    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        role: 'USER',
        verifiedAt: new Date(),
        accounts: {
          updateMany: {
            where: { identifier: normalizedEmail, provider: 'EMAIL' },
            data: { verifiedAt: new Date() },
          },
        },
      },
      include: { accounts: true },
    });
  }
}
