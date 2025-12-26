// internal
import { ConfigModule } from '@config/config.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { CacheModule } from '@shared/infrastructure/cache/cache.module';
import { DatabaseModule } from '@shared/infrastructure/database/database.module';
import { EmailModule } from '@shared/infrastructure/email/email.module';
import { HealthModule } from '@shared/infrastructure/health/health.module';
import { LoggingModule } from '@shared/infrastructure/logging/logging.module';
import { QueueModule } from '@shared/infrastructure/queue/queue.module';
import { ThrottlerModule } from '@shared/infrastructure/throttler/throttler.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
    EmailModule,
    HealthModule,
    ThrottlerModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
