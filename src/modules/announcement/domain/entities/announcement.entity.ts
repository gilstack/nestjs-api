import { AnnouncementStatus, AnnouncementTarget, AnnouncementType } from '../enums/announcement.enums';

export class Announcement {
  id: string;
  content: string;
  url?: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  target: AnnouncementTarget;
  creatorId: string;
  startedAt: Date;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(partial: Partial<Announcement>) {
    Object.assign(this, partial);
  }

  isActive(): boolean {
    const now = new Date();
    return (
      this.status === AnnouncementStatus.ACTIVE &&
      this.startedAt <= now &&
      (!this.expiredAt || this.expiredAt >= now)
    );
  }
}
