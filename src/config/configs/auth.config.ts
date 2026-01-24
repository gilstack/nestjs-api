import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  accessSecret: string;
  accessExpiresIn: number;
  refreshSecret: string;
  refreshExpiresIn: number;
  magicLinkCallbackPath: string;
  magicLinkExpiresIn: number;
  cookieDomain: string | undefined;
  cookieSecure: boolean;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    accessSecret: process.env.ACCESS_SECRET!,
    accessExpiresIn: parseInt(process.env.ACCESS_EXPIRES_IN || '10', 10),
    refreshSecret: process.env.REFRESH_SECRET!,
    refreshExpiresIn: parseInt(process.env.REFRESH_EXPIRES_IN || '1', 10),
    magicLinkCallbackPath: process.env.MAGIC_LINK_CALLBACK_PATH!,
    magicLinkExpiresIn: parseInt(process.env.MAGIC_LINK_EXPIRES_IN || '1800', 10),
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  }),
);

