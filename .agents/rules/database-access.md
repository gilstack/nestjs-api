# Database Access Pattern

## Overview

All database access in this project uses Prisma ORM (v7) through a centralized `PrismaService`. Access to the Prisma client is done through a single getter: `prisma.db`.

## Pattern

```typescript
// Always access database through the db getter
this.prisma.db.model.method(...)
```

## Correct Usage

```typescript
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.db.user.findUnique({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.db.user.create({ data });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.prisma.db.user.update({
      where: { id },
      data,
    });
  }
}
```

## Soft Delete Operations

The `db` accessor includes soft delete extensions:

```typescript
// Soft delete a record
await this.prisma.db.user.softDelete({ where: { id } });

// Restore a soft-deleted record
await this.prisma.db.user.restore({ where: { id } });

// Find including soft-deleted records
await this.prisma.db.user.findManyWithDeleted({ where: { ... } });
await this.prisma.db.user.findUniqueWithDeleted({ where: { id } });
```

## Transactions

```typescript
await this.prisma.db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.account.create({ data: { ...accountData, userId: user.id } });
  return user;
});
```

## Raw Queries

```typescript
const result = await this.prisma.db
  .$queryRaw`SELECT * FROM users WHERE id = ${id}`;
await this.prisma.db
  .$executeRaw`UPDATE users SET status = 'ACTIVE' WHERE id = ${id}`;
```

## Rules

1. **ALWAYS** use `prisma.db.model` for database access
2. **NEVER** access the Prisma client directly or create new instances
3. **NEVER** use deprecated patterns like:
   - `prisma.model` (without `.db`)
   - `prisma.withSoftDelete.model`
   - `prisma.client.model`
4. Repositories should be the only classes that directly use `PrismaService`
5. Use cases and services should depend on repository interfaces, not `PrismaService`

## Architecture

```
┌─────────────────┐
│   Use Case      │  Depends on IUserRepository
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  Implements IUserRepository
│   Interface     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PrismaRepository│  Uses PrismaService
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PrismaService   │  Exposes this.db
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Client   │  Extended with soft delete
└─────────────────┘
```
