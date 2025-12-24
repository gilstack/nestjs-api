import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import { MagicLinkToken } from '../../domain/entities/magic-link-token.entity';
import type { IMagicLinkTokenRepository } from '../../domain/repositories/magic-link-token.repository';

@Injectable()
export class PrismaMagicLinkTokenRepository implements IMagicLinkTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, tokenHash: string, expiresAt: Date): Promise<MagicLinkToken> {
    const record = await this.prisma.prisma.magicLinkToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
      },
    });

    return new MagicLinkToken({
      id: record.id,
      email: record.email,
      tokenHash: record.tokenHash,
      expiresAt: record.expiresAt,
      usedAt: record.usedAt,
      createdAt: record.createdAt,
    });
  }

  async findValidByEmail(email: string): Promise<MagicLinkToken[]> {
    const records = await this.prisma.prisma.magicLinkToken.findMany({
      where: {
        email,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(
      (record) =>
        new MagicLinkToken({
          id: record.id,
          email: record.email,
          tokenHash: record.tokenHash,
          expiresAt: record.expiresAt,
          usedAt: record.usedAt,
          createdAt: record.createdAt,
        }),
    );
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.prisma.magicLinkToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.prisma.magicLinkToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return result.count;
  }
}
