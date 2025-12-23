# Cache Layer

## Overview

The cache layer provides an abstracted caching interface with Redis and in-memory implementations.

## Structure

```
src/shared/infrastructure/cache/
├── cache.module.ts
├── interfaces/
│   └── cache.interface.ts
├── redis/
│   └── redis-cache.service.ts
└── memory/
    └── memory-cache.service.ts
```

## Interface

Location: `src/shared/infrastructure/cache/interfaces/cache.interface.ts`

```typescript
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  has(key: string): Promise<boolean>;
  flush(): Promise<void>;
  wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
}
```

## Implementations

### RedisCacheService

Production-ready implementation using `ioredis`:

- Connects to Redis using config from `TypedConfigService`
- Serializes values as JSON
- Supports TTL (time-to-live)
- Pattern-based deletion for cache invalidation

### MemoryCacheService

Development/testing implementation:

- Stores data in a `Map`
- Handles TTL expiration manually
- No external dependencies

## Cache Module

The module uses a factory to select implementation based on config:

```typescript
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useFactory: (config: TypedConfigService) => {
        if (config.cache.driver === 'memory') {
          return new MemoryCacheService();
        }
        return new RedisCacheService(config);
      },
      inject: [TypedConfigService],
    },
  ],
})
export class CacheModule {}
```

Set `CACHE_DRIVER=memory` in `.env` to use in-memory cache.

## Usage

### Basic Operations

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/constants/injection-tokens';
import type { ICacheService } from '@shared/infrastructure/cache/interfaces/cache.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async getUser(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.cache.get<User>(`user:${id}`);
    if (cached) return cached;

    // Fetch from database
    const user = await this.repository.findById(id);
    if (user) {
      await this.cache.set(`user:${id}`, user, 3600); // 1 hour TTL
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.repository.update(id, data);
    await this.cache.del(`user:${id}`); // Invalidate cache
    return user;
  }
}
```

### Using wrap() for Cache-Aside

The `wrap()` method simplifies the cache-aside pattern:

```typescript
async getUser(id: string): Promise<User | null> {
  return this.cache.wrap(
    `user:${id}`,
    () => this.repository.findById(id),
    3600,
  );
}
```

This automatically:
1. Checks cache for the key
2. If found, returns cached value
3. If not found, executes the function
4. Caches and returns the result

### Pattern-Based Invalidation

```typescript
// Delete all user-related cache entries
await this.cache.delPattern('user:*');

// Delete all cache for a specific user
await this.cache.delPattern(`user:${userId}:*`);
```

## Cache Key Conventions

Use consistent key naming:

```
{entity}:{id}                  -> user:123
{entity}:{id}:{relation}       -> user:123:posts
{entity}:list:{filters}        -> user:list:active
{entity}:count                 -> user:count
```
