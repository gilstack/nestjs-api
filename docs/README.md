# Infrastructure Documentation

This documentation covers the infrastructure layer of the Storagie API, including configuration, database, cache, queue, and logging systems.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [Configuration System](./config.md)
3. [Database Layer](./database.md)
4. [Cache Layer](./cache.md)
5. [Queue Layer](./queue.md)
6. [Logging System](./logging.md)

## Quick Reference

| Layer | Interface | Implementation | Token |
|-------|-----------|----------------|-------|
| Database | `IDatabaseService` | `PrismaService` | `DATABASE_SERVICE` |
| Cache | `ICacheService` | `RedisCacheService` / `MemoryCacheService` | `CACHE_SERVICE` |
| Queue | `IQueueService` | `BullMQQueueService` | `QUEUE_SERVICE` |
| Logging | `ILogger` | `PinoLoggerService` | `LOGGER_SERVICE` |

## Directory Structure

```
src/
├── config/                     # Configuration system
│   ├── config.module.ts
│   ├── config.service.ts       # TypedConfigService
│   ├── env.validation.ts       # Environment validation
│   └── configs/                # Modular configs
│       ├── app.config.ts
│       ├── cache.config.ts
│       ├── database.config.ts
│       ├── logging.config.ts
│       └── queue.config.ts
└── shared/
    ├── constants/
    │   └── injection-tokens.ts # DI tokens
    └── infrastructure/
        ├── database/
        ├── cache/
        ├── queue/
        └── logging/
```
