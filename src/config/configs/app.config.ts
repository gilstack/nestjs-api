import { registerAs } from '@nestjs/config';

export interface AppConfig {
  env: string;
  port: number;
  prefix: string;
  adminUrl: string;
  frontendUrl: string;
}

export default registerAs<AppConfig>(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    prefix: process.env.API_PREFIX || 'api',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  }),
);
