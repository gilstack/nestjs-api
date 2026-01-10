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
  // only setup in development
  if (config.app.env !== 'development') {
    return;
  }

  const connection = {
    host: config.queue.redis.host,
    port: config.queue.redis.port,
    password: config.queue.redis.password || undefined,
  };

  // create queue instances
  const queues = Object.values(QUEUE_NAMES).map(
    (queueName) => new BullMQAdapter(new Queue(queueName, { connection })),
  );

  // create Fastify adapter
  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // create board with all queues
  createBullBoard({
    queues,
    serverAdapter,
  });

  // register plugin with Fastify
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.register(serverAdapter.registerPlugin(), {
    prefix: '/admin/queues',
    basePath: '/admin/queues',
  });
}
