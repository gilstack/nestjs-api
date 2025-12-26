import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import { Session } from '../../domain/entities/session.entity';
import type {
  CreateSessionData,
  ISessionRepository,
} from '../../domain/repositories/session.repository';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionData): Promise<Session> {
    const record = await this.prisma.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });

    return new Session({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!record) return null;

    return new Session({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async findByUserId(userId: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { userId },
    });

    if (!record) return null;

    return new Session({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async update(id: string, data: Partial<CreateSessionData>): Promise<Session> {
    const record = await this.prisma.session.update({
      where: { id },
      data,
    });

    return new Session({
      id: record.id,
      userId: record.userId,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return result.count;
  }
}
