import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

import { ANNOUNCEMENT_REPOSITORY, ANNOUNCEMENT_SCHEDULER } from '../../domain/constants';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';
import type { IAnnouncementScheduler } from '../../domain/interfaces/announcement-scheduler.interface';
import type { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';
import { UpdateAnnouncementDto } from '../dtos/update-announcement.dto';

@Injectable()
export class UpdateAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
    @Inject(ANNOUNCEMENT_SCHEDULER)
    private readonly scheduler: IAnnouncementScheduler,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILogger,
  ) {}

  async execute(id: string, dto: UpdateAnnouncementDto): Promise<AnnouncementResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AnnouncementException.notFound();
    }

    const start = dto.startedAt || existing.startedAt;
    const end = dto.expiredAt !== undefined ? dto.expiredAt : existing.expiredAt;

    if (end && start > end) {
      throw AnnouncementException.invalidDates();
    }

    // if scheduling-related fields changed
    const schedulingChanged =
      dto.startedAt !== undefined || dto.expiredAt !== undefined || dto.status !== undefined;

    const updated = await this.repository.update(id, dto);

    // if relevant fields changed
    if (schedulingChanged) {
      await this.scheduler.reschedule(updated);
      this.logger.info('Announcement rescheduled', {
        announcementId: id,
        previousStatus: existing.status,
        newStatus: updated.status,
        startedAt: updated.startedAt,
        expiredAt: updated.expiredAt,
      });
    } else {
      this.logger.info('Announcement updated', { announcementId: id });
    }

    return new AnnouncementResponseDto(updated);
  }
}
