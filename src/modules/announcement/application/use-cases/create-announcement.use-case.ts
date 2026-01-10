import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

import { ANNOUNCEMENT_REPOSITORY, ANNOUNCEMENT_SCHEDULER } from '../../domain/constants';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus } from '../../domain/enums/announcement.enums';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';
import type { IAnnouncementScheduler } from '../../domain/interfaces/announcement-scheduler.interface';
import type { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';
import { CreateAnnouncementDto } from '../dtos/create-announcement.dto';

@Injectable()
export class CreateAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
    @Inject(ANNOUNCEMENT_SCHEDULER)
    private readonly scheduler: IAnnouncementScheduler,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILogger,
  ) {}

  async execute(dto: CreateAnnouncementDto, creatorId: string): Promise<AnnouncementResponseDto> {
    if (dto.startedAt && dto.expiredAt && dto.startedAt > dto.expiredAt) {
      throw AnnouncementException.invalidDates();
    }

    const announcement = new Announcement({
      ...dto,
      creatorId,
    });

    const created = await this.repository.create(announcement);

    // schedule jobs if applicable
    if (created.status === AnnouncementStatus.SCHEDULED) {
      await this.scheduler.scheduleActivation(created);
    } else if (created.status === AnnouncementStatus.ACTIVE && created.expiredAt) {
      await this.scheduler.scheduleExpiration(created);
    }

    this.logger.info('Announcement created', {
      announcementId: created.id,
      creatorId,
      status: created.status,
      startedAt: created.startedAt,
      expiredAt: created.expiredAt,
    });

    return new AnnouncementResponseDto(created);
  }
}
