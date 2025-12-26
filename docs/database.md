# Database Layer

## Overview

The database layer provides an abstracted interface for database operations, currently implemented with Prisma ORM.

## Structure

```
src/shared/infrastructure/database/
├── database.module.ts
├── interfaces/
│   └── database.interface.ts
└── prisma/
    └── prisma.service.ts
```

## Interface

Location: `src/shared/infrastructure/database/interfaces/database.interface.ts`

```typescript
export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

## PrismaService

Location: `src/shared/infrastructure/database/prisma/prisma.service.ts`

The service extends `PrismaClient` directly and implements `IDatabaseService`:

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  constructor(config: TypedConfigService) {
    super({
      log: config.database.logging ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async connect(): Promise<void> {
    await this.$connect();
  }

  async disconnect(): Promise<void> {
    await this.$disconnect();
  }


  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Access the Prisma client extended with Soft Delete capabilities.
   * Use this getter when you need to perform soft delete operations.
   */
  get withSoftDelete() {
    return this.extended;
  }
}
```

## Soft Delete

The Prisma Service includes a custom extension for Soft Delete (`deletedAt` field).

### Usage

```typescript
// Soft Delete a record
await this.prisma.withSoftDelete.user.softDelete({
  where: { id: userId },
});

// Restore a record
await this.prisma.withSoftDelete.user.restore({
  where: { id: userId },
});

// Find including deleted
await this.prisma.withSoftDelete.user.findManyWithDeleted({
  where: { email: '...' },
});
```

### Default Behavior

Standard Prisma calls (`this.prisma.user.findMany`, etc.) automatically exclude records where `deletedAt` is not null, thanks to global query filters in the extension.

## Usage

### Direct Prisma Access

For repository implementations that need Prisma-specific features:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Abstract Database Access

For code that should be ORM-agnostic:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_SERVICE } from '@shared/constants/injection-tokens';
import type { IDatabaseService } from '@shared/infrastructure/database/interfaces/database.interface';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_SERVICE) private readonly db: IDatabaseService,
  ) {}

  async checkDatabase(): Promise<boolean> {
    return this.db.healthCheck();
  }
}
```

## Prisma Schema

Location: `prisma/schema.prisma`

The schema defines all database models. After modifying:

```bash
# Generate client
pnpm db:generate

# Create migration
pnpm db:migrate
```

## Switching to TypeORM

To switch from Prisma to TypeORM:

1. Create `TypeOrmService` implementing `IDatabaseService`
2. Update `DatabaseModule`:

```typescript
@Module({
  providers: [
    {
      provide: DATABASE_SERVICE,
      useClass: TypeOrmService, // Changed from PrismaService
    },
  ],
})
export class DatabaseModule {}
```

Services using `IDatabaseService` will continue to work without changes.
