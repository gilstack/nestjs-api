import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { ICacheService } from '../interfaces/cache.interface';
import { TypedConfigService } from '@config/config.service';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleDestroy {
    private readonly client: Redis;
    private readonly defaultTTL: number;

    constructor(private readonly config: TypedConfigService) {
        const redisConfig = config.cache.redis;

        this.client = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        this.defaultTTL = config.cache.ttl;
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        const expiration = ttl ?? this.defaultTTL;

        if (expiration > 0) {
            await this.client.setex(key, expiration, serialized);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async delPattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    async has(key: string): Promise<boolean> {
        return (await this.client.exists(key)) === 1;
    }

    async flush(): Promise<void> {
        await this.client.flushdb();
    }

    async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
