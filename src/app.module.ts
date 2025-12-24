import { ConfigModule } from '@config/config.module';
import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { CacheModule } from '@shared/infrastructure/cache/cache.module';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { EmailModule } from '@shared/infrastructure/email/email.module';
import { LoggingModule } from '@shared/infrastructure/logging/logging.module';
import { QueueModule } from '@shared/infrastructure/queue/queue.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
    EmailModule,
    AuthModule,
  ],
})
export class AppModule {}
