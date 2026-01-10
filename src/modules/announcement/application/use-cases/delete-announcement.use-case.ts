import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

import { ANNOUNCEMENT_REPOSITORY, ANNOUNCEMENT_SCHEDULER } from '../../domain/constants';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';
import type { IAnnouncementScheduler } from '../../domain/interfaces/announcement-scheduler.interface';
import type { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';

@Injectable()
export class DeleteAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
    @Inject(ANNOUNCEMENT_SCHEDULER)
    private readonly scheduler: IAnnouncementScheduler,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AnnouncementException.notFound();
    }

    // cancel any pending jobs before deletion
    await this.scheduler.cancelJobs(id);
    await this.repository.delete(id);

    this.logger.info('Announcement deleted', {
      announcementId: id,
      previousStatus: existing.status,
    });
  }
}
