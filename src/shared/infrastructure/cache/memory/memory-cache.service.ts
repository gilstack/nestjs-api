import { Injectable } from '@nestjs/common';
import type { ICacheService } from '../interfaces/cache.interface';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

@Injectable()
export class MemoryCacheService implements ICacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keys = Array.from(this.cache.keys()).filter((k) => regex.test(k));
    for (const k of keys) {
      this.cache.delete(k);
    }
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}
