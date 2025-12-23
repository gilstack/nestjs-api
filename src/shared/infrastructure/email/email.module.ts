import { Global, Module } from '@nestjs/common';
import { EMAIL_SERVICE } from '@shared/constants/injection-tokens';
import { NodemailerEmailService } from './nodemailer/nodemailer-email.service';
import { EmailWorkerService } from './workers/email-worker.service';

@Global()
@Module({
    providers: [
        {
            provide: EMAIL_SERVICE,
            useClass: NodemailerEmailService,
        },
        EmailWorkerService,
    ],
    exports: [EMAIL_SERVICE],
})
export class EmailModule { }

