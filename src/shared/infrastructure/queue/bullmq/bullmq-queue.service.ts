import type { TypedConfigService } from '@config/config.service';
import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/constants/injection-tokens';
import { Queue } from 'bullmq';
import type { ICacheService } from '../../cache/interfaces/cache.interface';
import type { IQueueService, JobOptions } from '../interfaces/queue.interface';

@Injectable()
export class BullMQQueueService implements IQueueService, OnModuleDestroy {
  private readonly queues = new Map<string, Queue>();
  private readonly connection: { host: string; port: number; password?: string };
  private readonly defaultJobOptions: JobOptions;

  constructor(
    private readonly config: TypedConfigService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {
    this.connection = {
      host: config.queue.redis.host,
      port: config.queue.redis.port,
      password: config.queue.redis.password,
    };
    this.defaultJobOptions = config.queue.defaultJobOptions;
  }

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: this.defaultJobOptions,
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName) as Queue;
  }

  async add<T>(queueName: string, jobName: string, data: T, options?: JobOptions): Promise<string> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, options);
    return job.id!;
  }

  async addUnique<T>(
    queueName: string,
    jobName: string,
    data: T,
    uniqueKey: string,
    ttl = 300,
  ): Promise<string | null> {
    const lockKey = `queue:lock:${queueName}:${uniqueKey}`;

    if (await this.cache.has(lockKey)) {
      return null; // Job duplicado
    }

    await this.cache.set(lockKey, true, ttl);
    return this.add(queueName, jobName, data);
  }

  async remove(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.remove(jobId);
  }

  async clean(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.drain();
  }

  async pause(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resume(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async onModuleDestroy() {
    await Promise.all(Array.from(this.queues.values()).map((q) => q.close()));
  }
}
