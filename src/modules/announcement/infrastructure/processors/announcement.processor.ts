import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { Job } from 'bullmq';

import { ANNOUNCEMENT_REPOSITORY, ANNOUNCEMENT_SCHEDULER } from '../../domain/constants';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus } from '../../domain/enums/announcement.enums';
import type { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import type { IAnnouncementScheduler } from '../../domain/interfaces/announcement-scheduler.interface';
import type {
  AnnouncementJobData,
  AnnouncementJobResult,
} from '../../application/types/announcement-job.types';

@Processor(QUEUE_NAMES.ANNOUNCEMENT)
export class AnnouncementProcessor extends WorkerHost {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
    @Inject(ANNOUNCEMENT_SCHEDULER)
    private readonly scheduler: IAnnouncementScheduler,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<AnnouncementJobData>): Promise<AnnouncementJobResult> {
    const { announcementId, action, expectedDate } = job.data;
    const startTime = Date.now();

    this.logger.info('Processing announcement job', {
      jobId: job.id,
      announcementId,
      action,
    });

    try {
      const result =
        action === 'activate'
          ? await this.processActivation(announcementId, expectedDate)
          : await this.processExpiration(announcementId, expectedDate);

      this.logger.performance('announcement_job', Date.now() - startTime, {
        jobId: job.id,
        action,
        success: result.success,
        reason: result.reason,
      });

      return result;
    } catch (error) {
      this.logger.error('Announcement job failed', error as Error, {
        jobId: job.id,
        announcementId,
        action,
      });
      throw error;
    }
  }

  private async processActivation(
    announcementId: string,
    expectedDate: number,
  ): Promise<AnnouncementJobResult> {
    const announcement = await this.repository.findById(announcementId);

    if (!announcement) {
      this.logger.warn('Announcement not found for activation', { announcementId });
      return {
        success: false,
        action: 'activate',
        announcementId,
        reason: 'ANNOUNCEMENT_NOT_FOUND',
      };
    }

    if (announcement.status !== AnnouncementStatus.SCHEDULED) {
      this.logger.info('Announcement not in SCHEDULED status, skipping activation', {
        announcementId,
        currentStatus: announcement.status,
      });
      return {
        success: false,
        action: 'activate',
        announcementId,
        reason: `STATUS_IS_${announcement.status}`,
      };
    }

    if (announcement.startedAt.getTime() !== expectedDate) {
      this.logger.info('startedAt changed since job was scheduled, skipping', {
        announcementId,
        expected: new Date(expectedDate),
        actual: announcement.startedAt,
      });
      return {
        success: false,
        action: 'activate',
        announcementId,
        reason: 'DATE_CHANGED',
      };
    }

    await this.repository.updateStatus(announcementId, AnnouncementStatus.ACTIVE);

    this.logger.info('Announcement activated', {
      announcementId,
      activatedAt: new Date(),
    });

    if (announcement.expiredAt) {
      const updatedAnnouncement = new Announcement({
        ...announcement,
        status: AnnouncementStatus.ACTIVE,
      });
      await this.scheduler.scheduleExpiration(updatedAnnouncement);
    }

    return {
      success: true,
      action: 'activate',
      announcementId,
    };
  }

  private async processExpiration(
    announcementId: string,
    expectedDate: number,
  ): Promise<AnnouncementJobResult> {
    const announcement = await this.repository.findById(announcementId);

    if (!announcement) {
      this.logger.warn('Announcement not found for expiration', { announcementId });
      return {
        success: false,
        action: 'expire',
        announcementId,
        reason: 'ANNOUNCEMENT_NOT_FOUND',
      };
    }

    if (announcement.status !== AnnouncementStatus.ACTIVE) {
      this.logger.info('Announcement not in ACTIVE status, skipping expiration', {
        announcementId,
        currentStatus: announcement.status,
      });
      return {
        success: false,
        action: 'expire',
        announcementId,
        reason: `STATUS_IS_${announcement.status}`,
      };
    }

    if (!announcement.expiredAt || announcement.expiredAt.getTime() !== expectedDate) {
      this.logger.info('expiredAt changed since job was scheduled, skipping', {
        announcementId,
        expected: new Date(expectedDate),
        actual: announcement.expiredAt,
      });
      return {
        success: false,
        action: 'expire',
        announcementId,
        reason: 'DATE_CHANGED',
      };
    }

    await this.repository.updateStatus(announcementId, AnnouncementStatus.EXPIRED);

    this.logger.info('Announcement expired', {
      announcementId,
      expiredAt: new Date(),
    });

    return {
      success: true,
      action: 'expire',
      announcementId,
    };
  }
}
