import type { TypedConfigService } from '@config/config.service';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import type { INestApplication } from '@nestjs/common';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';
import { Queue } from 'bullmq';

export async function setupBullBoard(
  app: INestApplication,
  config: TypedConfigService,
): Promise<void> {
  // Only setup Bull Board in development
  if (config.app.env !== 'development') {
    return;
  }

  const connection = {
    host: config.queue.redis.host,
    port: config.queue.redis.port,
    password: config.queue.redis.password || undefined,
  };

  // Create queue instances for Bull Board
  const emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });

  // Create Fastify adapter for Bull Board
  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Create Bull Board with all queues
  createBullBoard({
    queues: [new BullMQAdapter(emailQueue)],
    serverAdapter,
  });

  // Register the Bull Board plugin with Fastify
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.register(serverAdapter.registerPlugin(), {
    prefix: '/admin/queues',
    basePath: '/admin/queues',
  });
}
