import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus, AnnouncementTarget } from '../../domain/enums/announcement.enums';
import { AnnouncementFilter, IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementMapper } from '../mappers/announcement.mapper';

@Injectable()
export class PrismaAnnouncementRepository implements IAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Announcement): Promise<Announcement> {
    const raw = await this.prisma.db.announcement.create({
      data: AnnouncementMapper.toPersistence(data),
    });
    return AnnouncementMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const raw = await this.prisma.db.announcement.update({
      where: { id },
      data: {
        content: data.content,
        url: data.url,
        type: data.type,
        status: data.status,
        target: data.target,
        startedAt: data.startedAt,
        expiredAt: data.expiredAt,
        deletedAt: data.deletedAt,
      },
    });
    return AnnouncementMapper.toDomain(raw);
  }

  async updateStatus(id: string, status: AnnouncementStatus): Promise<Announcement> {
    const raw = await this.prisma.db.announcement.update({
      where: { id },
      data: { status },
    });
    return AnnouncementMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.db.announcement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });
  }

  async findById(id: string): Promise<Announcement | null> {
    const raw = await this.prisma.db.announcement.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return AnnouncementMapper.toDomain(raw);
  }

  async findActive(target: AnnouncementTarget): Promise<Announcement[]> {
    const now = new Date();
    const raws = await this.prisma.db.announcement.findMany({
      where: {
        status: 'ACTIVE',
        target: { in: [target, 'ALL'] },
        startedAt: { lte: now },
        OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return raws.map(AnnouncementMapper.toDomain);
  }

  async findAll(filter: AnnouncementFilter): Promise<{ data: Announcement[]; total: number }> {
    const { status, target, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (status) where.status = status;
    if (target) where.target = target;

    const [raws, total] = await Promise.all([
      this.prisma.db.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.db.announcement.count({ where }),
    ]);

    return {
      data: raws.map(AnnouncementMapper.toDomain),
      total,
    };
  }

  async findReadyToActivate(): Promise<Announcement[]> {
    const now = new Date();
    const raws = await this.prisma.db.announcement.findMany({
      where: {
        status: 'SCHEDULED',
        startedAt: { lte: now },
        deletedAt: null,
      },
    });
    return raws.map(AnnouncementMapper.toDomain);
  }

  async findReadyToExpire(): Promise<Announcement[]> {
    const now = new Date();
    const raws = await this.prisma.db.announcement.findMany({
      where: {
        status: 'ACTIVE',
        expiredAt: { lte: now },
        deletedAt: null,
      },
    });
    return raws.map(AnnouncementMapper.toDomain);
  }
}
