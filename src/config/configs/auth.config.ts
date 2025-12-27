import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  accessSecret: string;
  accessExpiresIn: number;
  refreshSecret: string;
  refreshExpiresIn: number;
  magicLinkUrl: string;
  magicLinkExpiresIn: number;
  cookieDomain: string;
  cookieSecure: boolean;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    accessSecret: process.env.ACCESS_SECRET!,
    accessExpiresIn: parseInt(process.env.ACCESS_EXPIRES_IN || '10', 10),
    refreshSecret: process.env.REFRESH_SECRET!,
    refreshExpiresIn: parseInt(process.env.REFRESH_EXPIRES_IN || '7', 10),
    magicLinkUrl: process.env.MAGIC_LINK_URL!,
    magicLinkExpiresIn: parseInt(process.env.MAGIC_LINK_EXPIRES_IN || '1800', 10),
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
    cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  }),
);
