import { Injectable } from '@nestjs/common';
import {
  AccountProvider as PrismaAccountProvider,
  UserRole as PrismaUserRole,
  UserStatus as PrismaUserStatus,
} from '@shared/infrastructure/database/prisma/generated/client';

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
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.db.user.findFirst({
      where: { id },
      include: { accounts: true },
    });

    if (!user) return null;
    return user as unknown as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.db.user.findFirst({
      where: {
        accounts: {
          some: {
            identifier: normalizedEmail,
            provider: PrismaAccountProvider.EMAIL,
          },
        },
      },
      include: { accounts: true },
    });

    if (!user) return null;
    return user as unknown as User;
  }

  async createWithAccount(
    userData: CreateUserInput,
    accountData: CreateAccountInput,
  ): Promise<User> {
    const user = await this.prisma.db.user.create({
      data: {
        username: userData.username,
        tag: userData.tag,
        role: (userData.role as unknown as PrismaUserRole) ?? PrismaUserRole.GUEST,
        status: (userData.status as unknown as PrismaUserStatus) ?? PrismaUserStatus.PENDING,
        name: userData.name,
        image: userData.image,
        bio: userData.bio,
        accounts: {
          create: {
            identifier: accountData.identifier.toLowerCase().trim(),
            provider: accountData.provider as unknown as PrismaAccountProvider,
            providerId: accountData.providerId,
          },
        },
      },
      include: { accounts: true },
    });

    return user as unknown as User;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.prisma.db.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role ? (data.role as unknown as PrismaUserRole) : undefined,
        status: data.status ? (data.status as unknown as PrismaUserStatus) : undefined,
      },
      include: { accounts: true },
    });

    return user as unknown as User;
  }

  async activate(id: string, email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.db.user.update({
      where: { id },
      data: {
        status: PrismaUserStatus.ACTIVE,
        role: PrismaUserRole.USER,
        verifiedAt: new Date(),
        accounts: {
          updateMany: {
            where: {
              identifier: normalizedEmail,
              provider: PrismaAccountProvider.EMAIL,
            },
            data: { verifiedAt: new Date() },
          },
        },
      },
      include: { accounts: true },
    });

    return user as unknown as User;
  }
}
