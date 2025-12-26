# Queue Layer

## Overview

The queue layer provides an abstracted interface for background job processing using BullMQ.

## Structure

```
src/shared/infrastructure/queue/
├── queue.module.ts
├── interfaces/
│   └── queue.interface.ts
└── bullmq/
    └── bullmq-queue.service.ts
```

## Interface

Location: `src/shared/infrastructure/queue/interfaces/queue.interface.ts`

```typescript
export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: { type: "exponential" | "fixed"; delay: number };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface IQueueService {
  add<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<string>;
  addUnique<T>(
    queueName: string,
    jobName: string,
    data: T,
    uniqueKey: string,
    ttl?: number
  ): Promise<string | null>;
  remove(queueName: string, jobId: string): Promise<void>;
  clean(queueName: string): Promise<void>;
  pause(queueName: string): Promise<void>;
  resume(queueName: string): Promise<void>;
}
```

## BullMQQueueService

The implementation manages multiple queues dynamically:

- Creates queues on-demand
- Uses Redis for persistence
- Integrates with cache for deduplication via `addUnique()`

## Usage

### Adding Jobs

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { QUEUE_SERVICE } from "@shared/constants/injection-tokens";
import type { IQueueService } from "@shared/infrastructure/queue/interfaces/queue.interface";

@Injectable()
export class EmailService {
  constructor(@Inject(QUEUE_SERVICE) private readonly queue: IQueueService) {}

  async sendWelcomeEmail(userId: string, email: string): Promise<void> {
    await this.queue.add("email", "welcome", {
      userId,
      email,
      template: "welcome",
    });
  }

  async sendWithOptions(data: EmailData): Promise<void> {
    await this.queue.add("email", "send", data, {
      priority: 1,
      attempts: 5,
      backoff: { type: "exponential", delay: 1000 },
    });
  }
}
```

### Preventing Duplicate Jobs

Use `addUnique()` to prevent duplicate jobs:

```typescript
async sendPasswordReset(email: string): Promise<void> {
  // Only one reset email per user every 5 minutes
  const jobId = await this.queue.addUnique(
    'email',
    'password-reset',
    { email },
    `password-reset:${email}`,
    300, // 5 minutes TTL
  );

  if (jobId === null) {
    this.logger.info('Duplicate job prevented', { email });
  }
}
```

## Creating Workers

Workers process jobs from queues. Create them in the appropriate module:

```typescript
// src/modules/email/infrastructure/processors/email.processor.ts
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("email")
export class EmailProcessor extends WorkerHost {
  async process(job: Job<EmailJobData>): Promise<void> {
    switch (job.name) {
      case "welcome":
        await this.sendWelcome(job.data);
        break;
      case "password-reset":
        await this.sendPasswordReset(job.data);
        break;
    }
  }

  private async sendWelcome(data: EmailJobData): Promise<void> {
    // Send email logic
  }

  private async sendPasswordReset(data: EmailJobData): Promise<void> {
    // Send email logic
  }
}
```

Register the processor in the module:

```typescript
@Module({
  imports: [BullModule.registerQueue({ name: "email" })],
  providers: [EmailProcessor],
})
export class EmailModule {}
```

## Queue Naming Conventions

```
{domain}           -> email, notification, report
```

Job naming:

```
{action}           -> send, process, generate
{entity}.{action}  -> user.created, order.completed
```

## Monitoring

- **Development**: Bull Board is available at `http://localhost:3000/admin/queues` (or configured port)
- **Docker**: BullMQ Board is also available at `http://localhost:3001` when running with docker-compose.
