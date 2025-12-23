export interface LogContext {
    userId?: string;
    correlationId?: string;
    module?: string;
    method?: string;
    [key: string]: unknown;
}

export interface ILogger {
    setContext(context: LogContext): void;
    clearContext(): void;
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, error?: Error, meta?: unknown): void;
    performance(operation: string, durationMs: number, meta?: unknown): void;
    event(eventName: string, data?: unknown): void;
    audit(action: string, userId: string, resource: string, meta?: unknown): void;
    query(sql: string, durationMs: number, params?: unknown): void;
}
