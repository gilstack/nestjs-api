import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import { Session } from '../../domain/entities/session.entity';
import { SessionSource } from '../../domain/enums/session-source.enum';
import type {
  CreateSessionData,
  ISessionRepository,
} from '../../domain/repositories/session.repository';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionData): Promise<Session> {
    const record = await this.prisma.db.session.create({
      data: {
        userId: data.userId,
        source: data.source,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });

    return new Session({
      id: record.id,
      userId: record.userId,
      source: record.source as SessionSource,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const record = await this.prisma.db.session.findUnique({
      where: { id },
    });

    if (!record) return null;

    return new Session({
      id: record.id,
      userId: record.userId,
      source: record.source as SessionSource,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async findByUserIdAndSource(userId: string, source: SessionSource): Promise<Session | null> {
    const record = await this.prisma.db.session.findUnique({
      where: { userId_source: { userId, source } },
    });

    if (!record) return null;

    return new Session({
      id: record.id,
      userId: record.userId,
      source: record.source as SessionSource,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async update(id: string, data: Partial<Omit<CreateSessionData, 'source'>>): Promise<Session> {
    const record = await this.prisma.db.session.update({
      where: { id },
      data,
    });

    return new Session({
      id: record.id,
      userId: record.userId,
      source: record.source as SessionSource,
      refreshTokenHash: record.refreshTokenHash,
      userAgent: record.userAgent,
      ipAddress: record.ipAddress,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.db.session.delete({
      where: { id },
    });
  }

  async deleteByUserIdAndSource(userId: string, source: SessionSource): Promise<void> {
    await this.prisma.db.session.deleteMany({
      where: { userId, source },
    });
  }

  async expireByUserIdAndSource(userId: string, source: SessionSource): Promise<void> {
    await this.prisma.db.session.updateMany({
      where: { userId, source },
      data: { expiresAt: new Date() },
    });
  }

  async expireAllByUserId(userId: string): Promise<void> {
    await this.prisma.db.session.updateMany({
      where: { userId },
      data: { expiresAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return result.count;
  }
}
