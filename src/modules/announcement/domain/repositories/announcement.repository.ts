import { Announcement } from '../entities/announcement.entity';
import { AnnouncementStatus, AnnouncementTarget } from '../enums/announcement.enums';

export interface AnnouncementFilter {
  status?: string;
  target?: string;
  page?: number;
  limit?: number;
}

export interface IAnnouncementRepository {
  create(data: Announcement): Promise<Announcement>;
  update(id: string, data: Partial<Announcement>): Promise<Announcement>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Announcement | null>;
  findActive(target: AnnouncementTarget): Promise<Announcement | null>;
  findAll(filter: AnnouncementFilter): Promise<{ data: Announcement[]; total: number }>;

  /**
   * Update only the status of an announcement (for scheduler transitions)
   */
  updateStatus(id: string, status: AnnouncementStatus): Promise<Announcement>;

  /**
   * Find announcements ready to be activated (SCHEDULED with startedAt <= now)
   */
  findReadyToActivate(): Promise<Announcement[]>;

  /**
   * Find announcements ready to expire (ACTIVE with expiredAt <= now)
   */
  findReadyToExpire(): Promise<Announcement[]>;
}
