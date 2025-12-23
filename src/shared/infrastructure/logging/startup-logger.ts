import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const startupLogger = pino({
    level: 'info',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                levelFirst: true,
                translateTime: 'HH:MM:ss.l',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});
