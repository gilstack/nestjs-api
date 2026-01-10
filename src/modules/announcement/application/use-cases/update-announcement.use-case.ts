import { Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateAnnouncementDto } from '../dtos/update-announcement.dto';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { ANNOUNCEMENT_REPOSITORY } from '../../domain/constants';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';

@Injectable()
export class UpdateAnnouncementUseCase {
  private readonly logger = new Logger(UpdateAnnouncementUseCase.name);

  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
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

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Announcement updated: ${id}`);
    return new AnnouncementResponseDto(updated);
  }
}
