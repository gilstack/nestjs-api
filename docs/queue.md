# Queue Layer

## Overview

The queue layer provides an abstracted interface for background job processing using BullMQ with NestJS integration.

## Structure

```
src/shared/infrastructure/queue/
├── queue.module.ts           # Global BullMQ configuration
├── interfaces/
│   └── queue.interface.ts    # IQueueService interface
└── bullmq/
    ├── bullmq-queue.service.ts
    └── bull-board.setup.ts   # Bull Board monitoring
```

## Queue Configuration

The `QueueModule` provides global BullMQ configuration with Redis connection:

```typescript
// queue.module.ts
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: TypedConfigService) => ({
        connection: {
          host: config.queue.redis.host,
          port: config.queue.redis.port,
          password: config.queue.redis.password,
        },
      }),
    }),
  ],
  exports: [QUEUE_SERVICE, BullModule],
})
export class QueueModule {}
```

## Queue Constants

All queue names are centralized in `shared/constants/queue.constants.ts`:

```typescript
export const QUEUE_NAMES = {
  EMAIL: "email",
  ANNOUNCEMENT: "announcement",
} as const;

export const JOB_NAMES = {
  MAGIC_LINK: "magic-link", // Email
  ACTIVATE: "activate", // Announcement
  EXPIRE: "expire", // Announcement
} as const;
```

## Creating Processors

Use the `@Processor` decorator with centralized queue constants:

```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "@shared/constants/queue.constants";

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  async process(job: Job<EmailJobData>): Promise<void> {
    switch (job.name) {
      case "magic-link":
        await this.sendMagicLink(job.data);
        break;
    }
  }
}
```

## Registering Queues in Modules

Each module registers its queue via `BullModule.registerQueue()`:

```typescript
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL })],
  providers: [EmailProcessor],
})
export class EmailModule {}
```

## Adding Jobs via IQueueService

```typescript
@Injectable()
export class AnnouncementSchedulerService {
  constructor(@Inject(QUEUE_SERVICE) private readonly queue: IQueueService) {}

  async scheduleActivation(announcement: Announcement): Promise<string> {
    return this.queue.add(
      QUEUE_NAMES.ANNOUNCEMENT,
      `activate:${announcement.id}`,
      { announcementId: announcement.id, action: "activate" },
      { delay: delayMs, removeOnComplete: true }
    );
  }
}
```

## Delayed Jobs

For scheduled tasks, use the `delay` option:

```typescript
await this.queue.add(queueName, jobName, data, {
  delay: 3600000, // 1 hour in milliseconds
  removeOnComplete: true,
  removeOnFail: 100,
});
```

## Monitoring

- **Development**: Bull Board at `http://localhost:7000/admin/queues`
- Displays all queues defined in `QUEUE_NAMES`

## Queue Naming Conventions

```
{domain}           -> email, announcement, notification
```

Job naming:

```
{action}           -> send, activate, expire
{action}:{id}      -> activate:abc123
```
