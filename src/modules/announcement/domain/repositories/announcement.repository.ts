import { Announcement } from '../entities/announcement.entity';
import { AnnouncementTarget } from '../enums/announcement.enums';

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
}
