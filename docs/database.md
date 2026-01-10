# Database Layer

## Overview

The database layer provides an abstracted interface for database operations, implemented with Prisma ORM (v7) using driver adapters.

## Structure

```
src/shared/infrastructure/database/
├── database.module.ts
├── interfaces/
│   └── database.interface.ts
└── prisma/
    ├── prisma.service.ts
    ├── extensions/
    │   └── soft-delete.extension.ts
    └── generated/
        └── client.js
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

The service uses **Prisma 7 with driver adapters** (`@prisma/adapter-pg`) for PostgreSQL connection management:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "./generated/client.js";
import { softDeleteExtension } from "./extensions/soft-delete.extension";

export type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

function createExtendedClient(baseClient: PrismaClient) {
  return baseClient.$extends(softDeleteExtension);
}

@Injectable()
export class PrismaService
  implements IDatabaseService, OnModuleInit, OnModuleDestroy
{
  private readonly client: ExtendedPrismaClient;
  private readonly pool: pg.Pool;

  constructor(private readonly config: TypedConfigService) {
    this.pool = new pg.Pool({
      connectionString: config.database.url,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : undefined,
    });

    const adapter = new PrismaPg(this.pool);

    const baseClient = new PrismaClient({
      adapter,
      log: config.database.logging ? ["query", "error", "warn"] : ["error"],
    });

    this.client = createExtendedClient(baseClient);
  }

  /**
   * Get the extended Prisma client with soft delete support
   */
  get db(): ExtendedPrismaClient {
    return this.client;
  }

  async connect(): Promise<void> {
    await this.client.$connect();
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    await this.pool.end();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

### Key Features

- **Driver Adapters**: Uses `@prisma/adapter-pg` for native PostgreSQL connection pooling
- **Connection Pooling**: Managed via `pg.Pool` for better performance
- **Extensions**: Soft delete functionality via Prisma extensions
- **Single Access Point**: All database access through `prisma.db`

## Soft Delete

The Prisma Service includes a custom extension for Soft Delete (`deletedAt` field).

### Usage

```typescript
// Soft Delete a record
await this.prisma.db.user.softDelete({
  where: { id: userId },
});

// Restore a record
await this.prisma.db.user.restore({
  where: { id: userId },
});

// Find including deleted
await this.prisma.db.user.findManyWithDeleted({
  where: { email: "..." },
});
```

### Default Behavior

Standard Prisma calls (`this.prisma.db.user.findMany`, etc.) automatically exclude records where `deletedAt` is not null, thanks to query filters in the extension.

## Usage

### Repository Pattern (Recommended)

All database access should go through repositories using the `prisma.db` accessor:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/database/prisma/prisma.service";

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.db.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.db.user.create({ data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.db.user.softDelete({ where: { id } });
  }
}
```

### Abstract Database Access

For code that should be ORM-agnostic:

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { DATABASE_SERVICE } from "@shared/constants/injection-tokens";
import type { IDatabaseService } from "@shared/infrastructure/database/interfaces/database.interface";

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_SERVICE) private readonly db: IDatabaseService
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
