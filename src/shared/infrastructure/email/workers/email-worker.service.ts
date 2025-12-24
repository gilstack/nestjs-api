import { TypedConfigService } from '@config/config.service';
import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { EMAIL_SERVICE, LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import { type Job, Worker } from 'bullmq';
import type { IEmailService } from '../interfaces/email.interface';

export interface MagicLinkEmailJobData {
  email: string;
  magicLinkUrl: string;
  expiresInMinutes: number;
}

@Injectable()
export class EmailWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    private readonly config: TypedConfigService,
  ) {}

  onModuleInit(): void {
    const connection = {
      host: this.config.queue.redis.host,
      port: this.config.queue.redis.port,
      password: this.config.queue.redis.password || undefined,
    };

    this.worker = new Worker(
      'email',
      async (job: Job) => {
        await this.processJob(job);
      },
      { connection },
    );

    this.worker.on('completed', (job) => {
      this.logger.info('Email job completed', { jobId: job.id, jobName: job.name });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error('Email job failed', error, { jobId: job?.id, jobName: job?.name });
    });

    this.logger.info('Email worker started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.info('Email worker stopped');
    }
  }

  private async processJob(job: Job): Promise<void> {
    const start = Date.now();

    switch (job.name) {
      case 'magic-link':
        await this.processMagicLink(job.data as MagicLinkEmailJobData);
        break;
      default:
        this.logger.warn('Unknown email job type', { jobName: job.name });
    }

    this.logger.performance('email_job_processed', Date.now() - start, { jobName: job.name });
  }

  private async processMagicLink(data: MagicLinkEmailJobData): Promise<void> {
    await this.emailService.sendMagicLink(data.email, data.magicLinkUrl, data.expiresInMinutes);
  }
}
