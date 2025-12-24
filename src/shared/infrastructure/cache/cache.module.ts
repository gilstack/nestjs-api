import { TypedConfigService } from '@config/config.service';
import { Global, Module } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/constants/injection-tokens';
import { MemoryCacheService } from './memory/memory-cache.service';
import { RedisCacheService } from './redis/redis-cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useFactory: (config: TypedConfigService) => {
        if (config.cache.driver === 'memory') {
          return new MemoryCacheService();
        }
        return new RedisCacheService(config);
      },
      inject: [TypedConfigService],
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
