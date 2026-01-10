import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository';
import { ANNOUNCEMENT_REPOSITORY } from '../../domain/constants';
import { AnnouncementException } from '../../domain/exceptions/announcement.exception';

@Injectable()
export class DeleteAnnouncementUseCase {
  private readonly logger = new Logger(DeleteAnnouncementUseCase.name);

  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly repository: IAnnouncementRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AnnouncementException.notFound();
    }

    await this.repository.delete(id);
    this.logger.log(`Announcement deleted: ${id}`);
  }
}
