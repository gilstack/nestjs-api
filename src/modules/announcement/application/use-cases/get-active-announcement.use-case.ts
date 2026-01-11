import { Inject, Injectable } from '@nestjs/common';
import { ANNOUNCEMENT_REPOSITORY } from '../../domain/constants';
import { AnnouncementTarget } from '../../domain/enums/announcement.enums';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { AnnouncementResponseDto } from '../dtos/announcement-response.dto';

@Injectable()
export class GetActiveAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
  ) {}

  async execute(target: AnnouncementTarget): Promise<AnnouncementResponseDto[]> {
    const active = await this.repository.findActive(target);
    return active.map((a) => new AnnouncementResponseDto(a));
  }
}
