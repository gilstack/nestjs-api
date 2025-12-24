import { registerAs } from '@nestjs/config';

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential';
      delay: number;
    };
    removeOnComplete: number;
    removeOnFail: number;
  };
  concurrency: number;
}

export default registerAs(
  'queue',
  (): QueueConfig => ({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    },
    defaultJobOptions: {
      attempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3', 10),
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  }),
);
