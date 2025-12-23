import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { CacheModule } from '@shared/infrastructure/cache/cache.module';
import { QueueModule } from '@shared/infrastructure/queue/queue.module';
import { LoggingModule } from '@shared/infrastructure/logging/logging.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
  ],
})
export class AppModule { }
