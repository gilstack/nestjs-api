import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  driver: 'redis' | 'memory';
  ttl: number;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
}

export default registerAs(
  'cache',
  (): CacheConfig => ({
    driver: process.env.CACHE_DRIVER === 'memory' ? 'memory' : 'redis',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
  }),
);
