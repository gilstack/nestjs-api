# Infrastructure Documentation

This documentation covers the infrastructure layer of the Storagie API, including configuration, database, cache, queue, logging, authentication, and email systems.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [Configuration System](./config.md)
3. [Database Layer](./database.md)
4. [Cache Layer](./cache.md)
5. [Queue Layer](./queue.md)
6. [Logging System](./logging.md)
7. [Authentication System](./auth.md)
8. [Email System](./email.md)

## Quick Reference

| Layer    | Interface          | Implementation                             | Token              |
| -------- | ------------------ | ------------------------------------------ | ------------------ |
| Database | `IDatabaseService` | `PrismaService`                            | `DATABASE_SERVICE` |
| Cache    | `ICacheService`    | `RedisCacheService` / `MemoryCacheService` | `CACHE_SERVICE`    |
| Queue    | `IQueueService`    | `BullMQQueueService`                       | `QUEUE_SERVICE`    |
| Logging  | `ILogger`          | `PinoLoggerService`                        | `LOGGER_SERVICE`   |
| Email    | `IEmailService`    | `NodemailerEmailService`                   | `EMAIL_SERVICE`    |

## Directory Structure

```
src/
├── config/                     # Configuration system
│   ├── config.module.ts
│   ├── config.service.ts       # TypedConfigService
│   ├── env.validation.ts       # Environment validation
│   └── configs/                # Modular configs
│       ├── app.config.ts
│       ├── auth.config.ts      # JWT, cookies, magic link
│       ├── cache.config.ts
│       ├── database.config.ts
│       ├── email.config.ts     # SMTP settings
│       ├── logging.config.ts
│       └── queue.config.ts
├── modules/
│   ├── auth/                   # Authentication module
│   │   ├── application/        # Use cases, DTOs, services
│   │   ├── domain/             # Entities, repository interfaces
│   │   └── infrastructure/     # Controllers, guards, strategies
│   ├── user/                   # User module
│   └── announcement/           # Announcement module
└── shared/
    ├── constants/
    │   └── injection-tokens.ts # DI tokens
    ├── domain/
    │   └── repositories/       # Base repository interfaces
    └── infrastructure/
        ├── database/
        │   ├── interfaces/
        │   └── prisma/
        │       ├── prisma.service.ts
        │       ├── extensions/     # Prisma extensions (soft delete)
        │       └── generated/      # Generated Prisma client
        ├── cache/
        ├── queue/
        ├── logging/
        └── email/              # Email service and templates
```
