# Coding Style

## General Rules

1. Never use emojis in code, logs, or comments
2. Use Biome for linting and formatting
3. Use single quotes for strings
4. Use semicolons
5. Use trailing commas
6. Maximum line width: 100 characters
7. Indent with 2 spaces

## Imports

Order imports in this sequence:

1. Node.js built-in modules
2. External packages
3. Internal absolute imports (@shared, @config, @modules)
4. Relative imports

```typescript
import { join } from 'node:path';

import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CACHE_SERVICE } from '@shared/constants/injection-tokens';
import type { ICacheService } from '@shared/infrastructure/cache/interfaces/cache.interface';

import { UserMapper } from './mappers/user.mapper';
```

## Type Imports

Use `import type` for type-only imports:

```typescript
import type { ICacheService } from '@shared/infrastructure/cache/interfaces/cache.interface';
import type { User } from '../domain/entities/user.entity';
```

## Decorators

Place decorators on their own line:

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}
}
```

## Async/Await

Always use async/await over raw Promises:

```typescript
// Good
async findUser(id: string): Promise<User | null> {
  const user = await this.repository.findById(id);
  return user;
}

// Avoid
findUser(id: string): Promise<User | null> {
  return this.repository.findById(id).then(user => user);
}
```

## Error Handling

Use typed errors with meaningful messages:

```typescript
if (!user) {
  throw new NotFoundException(`User with id ${id} not found`);
}
```

## Comments

- Avoid obvious comments
- Use comments only for complex business logic
- Never use comments as section dividers
- Use JSDoc for public API documentation

```typescript
// Avoid
// Get user by id
async findById(id: string) {}

// Good - no comment needed, method name is self-explanatory
async findById(id: string) {}

// Good - complex logic needs explanation
/**
 * Calculates the discount based on user tier and order history.
 * Premium users with 10+ orders get an additional 5% off.
 */
calculateDiscount(user: User, orders: Order[]): number {}
```

## Logging

Use structured logging with metadata objects:

```typescript
// Good
this.logger.info('User created', { userId: user.id, email: user.email });

// Avoid
this.logger.info(`User created: ${user.id}`);
```

## DTOs

Use class-validator decorators:

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## Return Types

Always specify return types explicitly:

```typescript
// Good
async findById(id: string): Promise<User | null> {}

// Avoid
async findById(id: string) {}
```
