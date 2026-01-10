import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAnnouncementDto } from '../dtos/create-announcement.dto';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';
import { Announcement } from '../../domain/entities/announcement.entity';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { ANNOUNCEMENT_REPOSITORY } from '../../domain/constants';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';

@Injectable()
export class CreateAnnouncementUseCase {
  private readonly logger = new Logger(CreateAnnouncementUseCase.name);

  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
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
    this.logger.log(`Announcement created: ${created.id} by ${creatorId}`);
    return new AnnouncementResponseDto(created);
  }
}
