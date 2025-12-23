# Architecture Overview

## Principles

This project follows **Clean Architecture** principles with emphasis on:

1. **Dependency Inversion Principle (DIP)** - Core business logic depends on abstractions, not concrete implementations
2. **Repository Pattern** - Data access is abstracted through interfaces
3. **Modular Design** - Each infrastructure concern is isolated in its own module

## Abstraction Pattern

All infrastructure layers follow the same pattern:

```
1. Define an interface (contract)
2. Create a Symbol token for DI
3. Implement the interface in a concrete class
4. Bind the implementation in a module using the token
```

### Example Flow

```typescript
// 1. Interface (src/shared/infrastructure/cache/interfaces/cache.interface.ts)
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
}

// 2. Token (src/shared/constants/injection-tokens.ts)
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// 3. Implementation (src/shared/infrastructure/cache/redis/redis-cache.service.ts)
@Injectable()
export class RedisCacheService implements ICacheService {
  async get<T>(key: string): Promise<T | null> { ... }
  async set<T>(key: string, value: T, ttl?: number): Promise<void> { ... }
}

// 4. Module binding (src/shared/infrastructure/cache/cache.module.ts)
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
```

## Injection Tokens

All tokens are centralized in `src/shared/constants/injection-tokens.ts`:

```typescript
export const DATABASE_SERVICE = Symbol('DATABASE_SERVICE');
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');
export const QUEUE_SERVICE = Symbol('QUEUE_SERVICE');
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');

export const REPOSITORY_TOKENS = {
  USER: Symbol('USER_REPOSITORY'),
} as const;
```

## Using Infrastructure in Services

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE, LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ICacheService } from '@shared/infrastructure/cache/interfaces/cache.interface';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.cache.wrap(`user:${id}`, async () => {
      this.logger.info('Fetching user from database', { userId: id });
      return this.userRepository.findById(id);
    });
  }
}
```

## Switching Implementations

To switch from Redis to Memory cache, change only the module:

```typescript
// cache.module.ts
{
  provide: CACHE_SERVICE,
  useClass: MemoryCacheService, // Changed from RedisCacheService
}
```

No changes required in any service that uses `ICacheService`.
