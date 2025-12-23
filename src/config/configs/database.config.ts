import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
    url: string;
    ssl: boolean;
    logging: boolean;
}

export default registerAs(
    'database',
    (): DatabaseConfig => ({
        url: process.env.DATABASE_URL!,
        ssl: process.env.DB_SSL === 'true',
        logging: process.env.DB_LOGGING === 'true',
    }),
);
