import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { AppConfig } from './configs/app.config';
import type { AuthConfig } from './configs/auth.config';
import type { CacheConfig } from './configs/cache.config';
import type { DatabaseConfig } from './configs/database.config';
import type { EmailConfig } from './configs/email.config';
import type { LoggingConfig } from './configs/logging.config';
import type { QueueConfig } from './configs/queue.config';

@Injectable()
export class TypedConfigService {
  constructor(private configService: NestConfigService) {}

  get app(): AppConfig {
    return this.configService.get<AppConfig>('app')!;
  }

  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database')!;
  }

  get cache(): CacheConfig {
    return this.configService.get<CacheConfig>('cache')!;
  }

  get queue(): QueueConfig {
    return this.configService.get<QueueConfig>('queue')!;
  }

  get logging(): LoggingConfig {
    return this.configService.get<LoggingConfig>('logging')!;
  }

  get auth(): AuthConfig {
    return this.configService.get<AuthConfig>('auth')!;
  }

  get email(): EmailConfig {
    return this.configService.get<EmailConfig>('email')!;
  }

  get<T>(key: string): T | undefined {
    return this.configService.get<T>(key);
  }
}
