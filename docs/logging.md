# Logging System

## Overview

The logging system provides structured logging with Pino, featuring pretty printing in development and JSON output in production.

## Structure

```
src/shared/infrastructure/logging/
├── logging.module.ts
├── startup-logger.ts           # Pre-NestJS logger
├── interfaces/
│   └── logger.interface.ts
└── pino/
    └── pino-logger.service.ts
```

## Interface

Location: `src/shared/infrastructure/logging/interfaces/logger.interface.ts`

```typescript
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
```

## Startup Logger

Location: `src/shared/infrastructure/logging/startup-logger.ts`

A standalone Pino instance for logging before NestJS initializes:

```typescript
import { startupLogger } from '@shared/infrastructure/logging/startup-logger';

startupLogger.info('Application starting...');
startupLogger.fatal({ error: 'message' }, 'Fatal error');
```

## PinoLoggerService

The main logger implementation:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: data.email });

    const start = Date.now();
    const user = await this.repository.create(data);
    
    this.logger.performance('create_user', Date.now() - start);
    this.logger.event('user.created', { userId: user.id });
    this.logger.audit('CREATE', user.id, 'User');

    return user;
  }
}
```

## Log Methods

### Standard Logging

```typescript
logger.debug('Debug message', { detail: 'value' });
logger.info('Info message', { userId: '123' });
logger.warn('Warning message', { threshold: 100 });
logger.error('Error occurred', error, { context: 'value' });
```

### Performance Logging

```typescript
const start = Date.now();
await someOperation();
logger.performance('operation_name', Date.now() - start, { itemCount: 100 });
```

Output:
```json
{"level":"info","msg":"Performance: operation_name","performance":{"operation":"operation_name","duration_ms":150},"itemCount":100}
```

### Event Logging

For business events:

```typescript
logger.event('user.created', { userId: '123', email: 'user@example.com' });
logger.event('order.completed', { orderId: '456', total: 99.99 });
```

### Audit Logging

For compliance and security:

```typescript
logger.audit('CREATE', userId, 'User', { email: 'new@example.com' });
logger.audit('DELETE', userId, 'Post', { postId: '789' });
logger.audit('LOGIN', userId, 'Session', { ip: '192.168.1.1' });
```

### Query Logging

For database query performance:

```typescript
logger.query('SELECT * FROM users WHERE id = $1', 15, ['123']);
```

## Context Enrichment

Set context that will be included in all subsequent logs:

```typescript
export class RequestInterceptor {
  intercept(context, next) {
    const request = context.switchToHttp().getRequest();
    
    this.logger.setContext({
      correlationId: request.headers['x-correlation-id'],
      userId: request.user?.id,
      path: request.url,
    });

    return next.handle().pipe(
      tap(() => this.logger.clearContext()),
    );
  }
}
```

## Output Formats

### Development (pino-pretty)

```
12:30:45.123 INFO  Creating user
                   email: "user@example.com"
12:30:45.200 INFO  Performance: create_user
                   duration_ms: 77
```

### Production (JSON)

```json
{"level":"info","time":1703276445123,"msg":"Creating user","email":"user@example.com"}
{"level":"info","time":1703276445200,"msg":"Performance: create_user","performance":{"operation":"create_user","duration_ms":77}}
```

## Configuration

Environment variables:

- `LOG_LEVEL` - trace, debug, info, warn, error, fatal
- `NODE_ENV` - production disables pretty printing
- `ENABLE_PERF_LOGGING` - enable performance logging
- `ENABLE_QUERY_LOGGING` - enable query logging

## Sensitive Data

The following paths are automatically redacted:

- `req.headers.authorization`
- `req.headers.cookie`
- `req.body.password`
- `req.body.token`
- `req.body.secret`
