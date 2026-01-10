import { Inject, Injectable } from '@nestjs/common';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { ANNOUNCEMENT_REPOSITORY } from '../../domain/constants';
import { ListAnnouncementsDto } from '../dtos/list-announcements.dto';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';

@Injectable()
export class ListAnnouncementsUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
  ) {}

  async execute(dto: ListAnnouncementsDto): Promise<{ data: AnnouncementResponseDto[]; meta: { pagination: any } }> {
    const { page = 1, limit = 10 } = dto;
    const { data: rawData, total } = await this.repository.findAll(dto);

    const data = rawData.map((item) => new AnnouncementResponseDto(item));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }
}
