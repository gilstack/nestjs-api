import { Injectable, Scope, Inject } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import type { ILogger, LogContext } from '../interfaces/logger.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService implements ILogger {
    private logContext: LogContext = {};

    constructor(@InjectPinoLogger() private readonly logger: PinoLogger) { }

    setContext(context: LogContext): void {
        this.logContext = { ...this.logContext, ...context };
    }

    clearContext(): void {
        this.logContext = {};
    }

    private logWithContext(level: string, message: string, meta?: unknown) {
        const enrichedMeta = {
            ...this.logContext,
            ...(meta as object),
            timestamp: new Date().toISOString(),
        };
        (this.logger as any)[level](enrichedMeta, message);
    }

    debug(message: string, meta?: unknown): void {
        this.logWithContext('debug', message, meta);
    }

    info(message: string, meta?: unknown): void {
        this.logWithContext('info', message, meta);
    }

    warn(message: string, meta?: unknown): void {
        this.logWithContext('warn', message, meta);
    }

    error(message: string, error?: Error, meta?: unknown): void {
        this.logWithContext('error', message, {
            ...(meta as object),
            error: error
                ? { name: error.name, message: error.message, stack: error.stack }
                : undefined,
        });
    }

    performance(operation: string, durationMs: number, meta?: unknown): void {
        this.info(`Performance: ${operation}`, {
            ...(meta as object),
            performance: { operation, duration_ms: durationMs },
        });
    }

    event(eventName: string, data?: unknown): void {
        this.info(`Event: ${eventName}`, { event: { name: eventName, data } });
    }

    audit(action: string, userId: string, resource: string, meta?: unknown): void {
        this.info(`Audit: ${action}`, {
            ...(meta as object),
            audit: { action, userId, resource, timestamp: new Date().toISOString() },
        });
    }

    query(sql: string, durationMs: number, params?: unknown): void {
        this.debug('Database query', {
            query: { sql, params, duration_ms: durationMs },
        });
    }
}
