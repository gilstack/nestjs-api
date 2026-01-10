import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { TypedConfigService } from '@config/config.service';
import { ConfigModule } from '@config/config.module';
import { QUEUE_SERVICE } from '@shared/constants/injection-tokens';
import { BullMQQueueService } from './bullmq/bullmq-queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => ({
        connection: {
          host: config.queue.redis.host,
          port: config.queue.redis.port,
          password: config.queue.redis.password || undefined,
        },
        defaultJobOptions: config.queue.defaultJobOptions,
      }),
    }),
  ],
  providers: [
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQQueueService,
    },
  ],
  exports: [QUEUE_SERVICE, BullModule],
})
export class QueueModule {}
