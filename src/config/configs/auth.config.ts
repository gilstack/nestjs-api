import { registerAs } from '@nestjs/config';

export interface AuthConfig {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    magicLinkUrl: string;
    magicLinkExpiresIn: number;
    cookieDomain: string;
    cookieSecure: boolean;
}

export default registerAs('auth', (): AuthConfig => ({
    accessSecret: process.env.ACCESS_SECRET!,
    accessExpiresIn: process.env.ACCESS_EXPIRES_IN || '10m',
    refreshSecret: process.env.REFRESH_SECRET!,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '1d',
    magicLinkUrl: process.env.MAGIC_LINK_URL!,
    magicLinkExpiresIn: parseInt(process.env.MAGIC_LINK_EXPIRES_IN || '1800', 10),
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
}));
