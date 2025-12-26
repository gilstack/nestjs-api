import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler';

// internal
import { TypedConfigService } from '@config/config.service';

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000, // 1s
            limit: 3, // 3req / sec
          },
          {
            name: 'medium',
            ttl: 10000, // 10s
            limit: 20, // 20req / 10s
          },
          {
            name: 'long',
            ttl: 60000, // 1m
            limit: 100, // 100req / 1m
          },
        ],
        errorMessage: 'Too many requests. Please try again later.',
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [NestThrottlerModule],
})
export class ThrottlerModule { }
