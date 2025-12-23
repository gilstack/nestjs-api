import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { AppConfig } from './configs/app.config';
import type { DatabaseConfig } from './configs/database.config';
import type { CacheConfig } from './configs/cache.config';
import type { QueueConfig } from './configs/queue.config';
import type { LoggingConfig } from './configs/logging.config';

@Injectable()
export class TypedConfigService {
    constructor(private configService: NestConfigService) { }

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

    get<T>(key: string): T | undefined {
        return this.configService.get<T>(key);
    }
}
