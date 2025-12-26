import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  logotype: string;
}

export default registerAs(
  'email',
  (): EmailConfig => ({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@storagie.app',
    logotype: process.env.EMAIL_LOGOTYPE_URL || 'https://storagie.app/logo.png',
  }),
);
