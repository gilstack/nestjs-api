# Configuration System

## Overview

The configuration system provides type-safe access to environment variables with validation at startup.

## Components

### 1. Environment Validation

Location: `src/config/env.validation.ts`

Validates environment variables using `class-validator` before the application starts:

```typescript
import { validateEnv } from "@config/env.validation";

// Throws if validation fails
const env = validateEnv(process.env);
```

Required variables:

- `DATABASE_URL` - PostgreSQL connection string

Optional variables with defaults:

- `NODE_ENV` - defaults to `development`
- `PORT` - defaults to `3000`
- `API_PREFIX` - defaults to `api`

### 2. Modular Configs

Each domain has its own config file in `src/config/configs/`:

| File                 | Namespace  | Description              |
| -------------------- | ---------- | ------------------------ |
| `app.config.ts`      | `app`      | Application settings     |
| `database.config.ts` | `database` | Database connection      |
| `cache.config.ts`    | `cache`    | Cache driver and TTL     |
| `queue.config.ts`    | `queue`    | BullMQ settings          |
| `logging.config.ts`  | `logging`  | Log level and formatting |
| `auth.config.ts`     | `auth`     | JWT, cookies, magic link |
| `email.config.ts`    | `email`    | SMTP settings            |
| `newrelic.config.ts` | `newrelic` | APM configuration        |

### 3. TypedConfigService

Location: `src/config/config.service.ts`

Provides type-safe access to all configurations:

```typescript
import { TypedConfigService } from "@config/config.service";

@Injectable()
export class MyService {
  constructor(private readonly config: TypedConfigService) {}

  someMethod() {
    // Full autocomplete support
    const port = this.config.app.port;
    const dbUrl = this.config.database.url;
    const cacheDriver = this.config.cache.driver;
  }
}
```

## Configuration Interfaces

### AppConfig

```typescript
interface AppConfig {
  env: string; // NODE_ENV
  port: number; // PORT
  prefix: string; // API_PREFIX
  adminUrl: string; // ADMIN_URL
  frontendUrl: string; // FRONTEND_URL
}
```

### DatabaseConfig

```typescript
interface DatabaseConfig {
  url: string; // DATABASE_URL
  ssl: boolean; // DB_SSL
  logging: boolean; // DB_LOGGING
}
```

### CacheConfig

```typescript
interface CacheConfig {
  driver: "redis" | "memory"; // CACHE_DRIVER
  ttl: number; // CACHE_TTL (seconds)
  redis: {
    host: string; // REDIS_HOST
    port: number; // REDIS_PORT
    password?: string; // REDIS_PASSWORD
    db: number; // REDIS_DB
  };
}
```

### QueueConfig

```typescript
interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions: {
    attempts: number; // QUEUE_RETRY_ATTEMPTS
    backoff: { type: "exponential"; delay: number };
    removeOnComplete: number;
    removeOnFail: number;
  };
  concurrency: number; // QUEUE_CONCURRENCY
}
```

### LoggingConfig

```typescript
interface LoggingConfig {
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal"; // LOG_LEVEL
  prettyPrint: boolean; // true if NODE_ENV !== 'production'
  enablePerformanceLogging: boolean; // ENABLE_PERF_LOGGING
  enableQueryLogging: boolean; // ENABLE_QUERY_LOGGING
}
```

### AuthConfig

```typescript
interface AuthConfig {
  accessSecret: string; // ACCESS_SECRET (min 32 chars)
  accessExpiresIn: number; // ACCESS_EXPIRES_IN (minutes, default: 10)
  refreshSecret: string; // REFRESH_SECRET (min 32 chars)
  refreshExpiresIn: number; // REFRESH_EXPIRES_IN (days, default: 7)
  magicLinkCallbackPath: string; // MAGIC_LINK_CALLBACK_PATH
  magicLinkExpiresIn: number; // MAGIC_LINK_EXPIRES_IN (seconds)
  cookieDomain: string; // COOKIE_DOMAIN
  cookieSecure: boolean; // COOKIE_SECURE
}
```

### EmailConfig

```typescript
interface EmailConfig {
  host: string; // SMTP_HOST
  port: number; // SMTP_PORT
  user?: string; // SMTP_USER (optional)
  pass?: string; // SMTP_PASS (optional)
  from: string; // SMTP_FROM
}
```

### NewRelicConfig

```typescript
interface NewRelicConfig {
  enabled: boolean; // NEW_RELIC_ENABLED
  appName: string; // NEW_RELIC_APP_NAME
  licenseKey: string; // NEW_RELIC_LICENSE_KEY
  distributedTracingEnabled: boolean; // NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
  logLevel: string; // NEW_RELIC_LOG_LEVEL
}
```

## Adding a New Config

1. Create the config file:

```typescript
// src/config/configs/auth.config.ts
import { registerAs } from "@nestjs/config";

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export default registerAs(
  "auth",
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  }),
);
```

2. Add to config index:

```typescript
// src/config/index.ts
import authConfig from "./configs/auth.config";

export const configs = [
  appConfig,
  databaseConfig,
  // ...
  authConfig, // Add here
];
```

3. Add to TypedConfigService:

```typescript
// src/config/config.service.ts
import type { AuthConfig } from "./configs/auth.config";

@Injectable()
export class TypedConfigService {
  get auth(): AuthConfig {
    return this.configService.get<AuthConfig>("auth")!;
  }
}
```

4. Add validation if required:

```typescript
// src/config/env.validation.ts
export class EnvironmentVariables {
  @IsString()
  JWT_SECRET: string;
}
```
