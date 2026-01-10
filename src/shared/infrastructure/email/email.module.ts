import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { EMAIL_SERVICE } from '@shared/constants/injection-tokens';
import { QUEUE_NAMES } from '@shared/constants/queue.constants';
import { NodemailerEmailService } from './nodemailer/nodemailer-email.service';
import { EmailProcessor } from './processors/email.processor';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL })],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: NodemailerEmailService,
    },
    EmailProcessor,
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
