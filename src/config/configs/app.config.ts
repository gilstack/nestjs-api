import { registerAs } from '@nestjs/config';

export interface AppConfig {
  env: string;
  port: number;
  prefix: string;
  admin: string;
  frontend: string;
}

export default registerAs<AppConfig>(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8000', 10),
    prefix: process.env.API_PREFIX || 'api',
    admin: process.env.DASHBOARD_URL || 'http://localhost:3010',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  }),
);
