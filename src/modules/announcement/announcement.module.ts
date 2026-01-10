import { Module } from '@nestjs/common';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { ANNOUNCEMENT_REPOSITORY } from './domain/constants';
import { AnnouncementController } from './infrastructure/controllers/announcement.controller';
import { PrismaAnnouncementRepository } from './infrastructure/repositories/prisma-announcement.repository';
import {
  CreateAnnouncementUseCase,
  DeleteAnnouncementUseCase,
  GetActiveAnnouncementUseCase,
  ListAnnouncementsUseCase,
  UpdateAnnouncementUseCase,
} from './application/use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [AnnouncementController],
  providers: [
    {
      provide: ANNOUNCEMENT_REPOSITORY,
      useClass: PrismaAnnouncementRepository,
    },
    CreateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    GetActiveAnnouncementUseCase,
    ListAnnouncementsUseCase,
    UpdateAnnouncementUseCase,
  ],
  exports: [],
})
export class AnnouncementModule {}
