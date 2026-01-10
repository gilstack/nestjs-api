import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE, QUEUE_SERVICE } from '@shared/constants/injection-tokens';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { IQueueService } from '@shared/infrastructure/queue/interfaces/queue.interface';

import type { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus } from '../../domain/enums/announcement.enums';
import type { IAnnouncementScheduler } from '../../domain/interfaces/announcement-scheduler.interface';
import type { AnnouncementJobData } from '../../application/types/announcement-job.types';

@Injectable()
export class AnnouncementSchedulerService implements IAnnouncementScheduler {
  constructor(
    @Inject(QUEUE_SERVICE) private readonly queue: IQueueService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
  ) {}

  async scheduleActivation(announcement: Announcement): Promise<string | null> {
    if (announcement.status !== AnnouncementStatus.SCHEDULED) {
      return null;
    }

    const delay = announcement.startedAt.getTime() - Date.now();
    const effectiveDelay = Math.max(delay, 0);

    const jobData: AnnouncementJobData = {
      announcementId: announcement.id,
      action: 'activate',
      expectedDate: announcement.startedAt.getTime(),
      scheduledAt: Date.now(),
    };

    const jobId = await this.queue.add(
      QUEUE_NAMES.ANNOUNCEMENT,
      `activate:${announcement.id}`,
      jobData,
      { delay: effectiveDelay, removeOnComplete: true, removeOnFail: 100 },
    );

    this.logger.info('Scheduled activation job', {
      announcementId: announcement.id,
      jobId,
      scheduledFor: announcement.startedAt,
      delayMs: effectiveDelay,
    });

    return jobId;
  }

  async scheduleExpiration(announcement: Announcement): Promise<string | null> {
    if (announcement.status !== AnnouncementStatus.ACTIVE || !announcement.expiredAt) {
      return null;
    }

    const delay = announcement.expiredAt.getTime() - Date.now();
    const effectiveDelay = Math.max(delay, 0);

    const jobData: AnnouncementJobData = {
      announcementId: announcement.id,
      action: 'expire',
      expectedDate: announcement.expiredAt.getTime(),
      scheduledAt: Date.now(),
    };

    const jobId = await this.queue.add(
      QUEUE_NAMES.ANNOUNCEMENT,
      `expire:${announcement.id}`,
      jobData,
      { delay: effectiveDelay, removeOnComplete: true, removeOnFail: 100 },
    );

    this.logger.info('Scheduled expiration job', {
      announcementId: announcement.id,
      jobId,
      scheduledFor: announcement.expiredAt,
      delayMs: effectiveDelay,
    });

    return jobId;
  }

  async cancelJobs(announcementId: string): Promise<void> {
    try {
      await this.queue.remove(QUEUE_NAMES.ANNOUNCEMENT, `activate:${announcementId}`);
      await this.queue.remove(QUEUE_NAMES.ANNOUNCEMENT, `expire:${announcementId}`);

      this.logger.debug('Cancelled announcement jobs', { announcementId });
    } catch (error) {
      this.logger.debug('Failed to cancel jobs (may not exist)', {
        announcementId,
        error: (error as Error).message,
      });
    }
  }

  async reschedule(announcement: Announcement): Promise<void> {
    await this.cancelJobs(announcement.id);

    if (announcement.status === AnnouncementStatus.SCHEDULED) {
      await this.scheduleActivation(announcement);
    } else if (announcement.status === AnnouncementStatus.ACTIVE && announcement.expiredAt) {
      await this.scheduleExpiration(announcement);
    }
  }
}
