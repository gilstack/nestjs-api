import { Global, Module } from '@nestjs/common';
import { QUEUE_SERVICE } from '@shared/constants/injection-tokens';
import { BullMQQueueService } from './bullmq/bullmq-queue.service';

@Global()
@Module({
  providers: [
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQQueueService,
    },
  ],
  exports: [QUEUE_SERVICE],
})
export class QueueModule {}
