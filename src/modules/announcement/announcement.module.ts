import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';

import {
  CreateAnnouncementUseCase,
  DeleteAnnouncementUseCase,
  GetActiveAnnouncementUseCase,
  ListAnnouncementsUseCase,
  UpdateAnnouncementUseCase,
} from './application/use-cases';
import { ANNOUNCEMENT_REPOSITORY, ANNOUNCEMENT_SCHEDULER } from './domain/constants';
import { AnnouncementController } from './infrastructure/controllers/announcement.controller';
import { AnnouncementProcessor } from './infrastructure/processors/announcement.processor';
import { PrismaAnnouncementRepository } from './infrastructure/repositories/prisma-announcement.repository';
import { AnnouncementSchedulerService } from './infrastructure/services/announcement-scheduler.service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.ANNOUNCEMENT }),
  ],
  controllers: [AnnouncementController],
  providers: [
    {
      provide: ANNOUNCEMENT_REPOSITORY,
      useClass: PrismaAnnouncementRepository,
    },
    {
      provide: ANNOUNCEMENT_SCHEDULER,
      useClass: AnnouncementSchedulerService,
    },
    AnnouncementProcessor,
    CreateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
    GetActiveAnnouncementUseCase,
    ListAnnouncementsUseCase,
    UpdateAnnouncementUseCase,
  ],
  exports: [],
})
export class AnnouncementModule {}
