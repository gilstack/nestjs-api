import { Announcement as PrismaAnnouncement } from '@prisma/client';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus, AnnouncementTarget, AnnouncementType } from '../../domain/enums/announcement.enums';

export class AnnouncementMapper {
  static toDomain(raw: PrismaAnnouncement): Announcement {
    return new Announcement({
      id: raw.id,
      content: raw.content,
      url: raw.url ?? undefined,
      type: AnnouncementType[raw.type as keyof typeof AnnouncementType],
      status: AnnouncementStatus[raw.status as keyof typeof AnnouncementStatus],
      target: AnnouncementTarget[raw.target as keyof typeof AnnouncementTarget],
      creatorId: raw.creatorId,
      startedAt: raw.startedAt,
      expiredAt: raw.expiredAt ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? undefined,
    });
  }

  static toPersistence(domain: Announcement): PrismaAnnouncement {
    return {
      id: domain.id,
      content: domain.content,
      url: domain.url ?? null,
      type: domain.type,
      status: domain.status,
      target: domain.target,
      creatorId: domain.creatorId,
      startedAt: domain.startedAt,
      expiredAt: domain.expiredAt ?? null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt ?? null,
    };
  }
}
