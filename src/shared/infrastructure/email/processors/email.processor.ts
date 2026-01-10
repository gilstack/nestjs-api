import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { EMAIL_SERVICE, LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { Job } from 'bullmq';
import type { IEmailService } from '../interfaces/email.interface';

export interface MagicLinkEmailJobData {
  email: string;
  userName: string | null;
  magicLinkUrl: string;
  expiresInMinutes: number;
}

export type EmailJobData = MagicLinkEmailJobData;

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  constructor(
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const start = Date.now();

    try {
      switch (job.name) {
        case 'magic-link':
          await this.processMagicLink(job.data as MagicLinkEmailJobData);
          break;
        default:
          this.logger.warn('Unknown email job type', { jobName: job.name });
      }

      this.logger.performance('email_job', Date.now() - start, { jobName: job.name });
    } catch (error) {
      this.logger.error('Email job failed', error as Error, { jobName: job.name, jobId: job.id });
      throw error;
    }
  }

  private async processMagicLink(data: MagicLinkEmailJobData): Promise<void> {
    await this.emailService.sendMagicLink(
      data.email,
      data.userName,
      data.magicLinkUrl,
      data.expiresInMinutes,
    );
    this.logger.info('Magic link email sent', { email: data.email });
  }
}
