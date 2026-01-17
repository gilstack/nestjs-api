# Application Performance Monitoring (APM)

## Overview

The project uses **New Relic** for Application Performance Monitoring. The integration is designed to be non-intrusive and disabled by default in development.

## Configuration

### Environment Variables

| Variable                                | Default        | Description                         |
| --------------------------------------- | -------------- | ----------------------------------- |
| `NEW_RELIC_ENABLED`                     | `false`        | Enable/disable the agent            |
| `NEW_RELIC_APP_NAME`                    | `Storagie API` | Application name in dashboard       |
| `NEW_RELIC_LICENSE_KEY`                 | -              | License key (required when enabled) |
| `NEW_RELIC_DISTRIBUTED_TRACING_ENABLED` | `true`         | Enable distributed tracing          |
| `NEW_RELIC_LOG_LEVEL`                   | `info`         | Agent log level                     |

### TypedConfigService

Access New Relic config programmatically:

```typescript
constructor(private readonly config: TypedConfigService) {
  const isEnabled = this.config.newrelic.enabled;
  const appName = this.config.newrelic.appName;
}
```

## Files

| File                                    | Description                |
| --------------------------------------- | -------------------------- |
| `newrelic.ts`                           | Agent configuration (root) |
| `src/config/configs/newrelic.config.ts` | Typed config for NestJS    |

## Usage

### Development (APM Disabled)

```bash
pnpm dev
```

### Development (APM Enabled)

```bash
pnpm dev:apm
```

Or set environment variable:

```bash
NEW_RELIC_ENABLED=true pnpm dev
```

### Production

```bash
pnpm prod:apm
```

## Scripts

| Script           | Description                |
| ---------------- | -------------------------- |
| `pnpm dev`       | Development without APM    |
| `pnpm dev:apm`   | Development with New Relic |
| `pnpm debug:apm` | Debug mode with New Relic  |
| `pnpm prod:apm`  | Production with New Relic  |

## Agent Configuration

The `newrelic.ts` file contains the full agent configuration:

- **Security**: Excludes sensitive headers and body fields
- **Error Collector**: Ignores common HTTP status codes (400, 401, 403, 404, 422)
- **SQL Tracking**: Records queries in obfuscated format
- **Logging**: Outputs to stdout

### Excluded Attributes

The following are automatically excluded from traces:

- `request.headers.cookie`
- `request.headers.authorization`
- `request.headers.x-api-key`
- `request.body.password`
- `request.body.token`
- `request.body.secret`
- `request.body.refreshToken`

## Adding Custom Instrumentation

For custom transaction naming or instrumentation:

```typescript
import newrelic from "newrelic";

// Custom transaction name
newrelic.setTransactionName("custom/transaction/name");

// Add custom attributes
newrelic.addCustomAttributes({
  userId: user.id,
  action: "special_action",
});
```

## Dashboard Access

1. Log into [New Relic](https://one.newrelic.com)
2. Navigate to APM → Services
3. Find your application by `NEW_RELIC_APP_NAME`
