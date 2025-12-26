# HTTP Layer

## Overview

The HTTP layer provides standardized response formatting and error handling across all API endpoints.

## Structure

```
src/shared/infrastructure/http/
├── exceptions/
│   ├── app.exception.ts
│   └── domain.exception.ts
├── filters/
│   └── http-exception.filter.ts
├── interceptors/
│   └── response.interceptor.ts
├── types/
│   └── response.types.ts
└── index.ts
```

## Response Format

### Success Response

All successful responses follow the format:

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-26T11:00:00.000Z",
    "path": "/api/resource",
    "requestId": "uuid-v4"
  }
}
```

### Error Response

All error responses follow the format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 400,
    "details": null
  },
  "meta": {
    "timestamp": "2025-12-26T11:00:00.000Z",
    "path": "/api/resource",
    "requestId": "uuid-v4"
  }
}
```

## Custom Exceptions

### AppException (Base)

Base exception for all custom errors:

```typescript
import { AppException } from '@shared/infrastructure/http';

throw new AppException({
  code: 'CUSTOM_ERROR',
  message: 'Something went wrong',
  statusCode: HttpStatus.BAD_REQUEST,
  details: { field: 'value' },
});
```

### DomainException

For business logic errors (defaults to 422):

```typescript
import { DomainException } from '@shared/infrastructure/http';

throw new DomainException({
  code: 'INVALID_OPERATION',
  message: 'Cannot perform this operation',
});
```

### Module-Specific Exceptions

Each module can define its own exceptions:

```typescript
// src/modules/auth/domain/exceptions/auth.exception.ts
import { AppException } from '@shared/infrastructure/http';

export class AuthException extends AppException {
  static invalidToken(): AuthException {
    return new AuthException({
      code: 'AUTH_INVALID_TOKEN',
      message: 'Token inválido ou expirado',
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  }
}

// Usage
throw AuthException.invalidToken();
```

## Bootstrap Configuration

The HTTP layer is configured globally in `bootstrap.ts`:

```typescript
import { HttpExceptionFilter, ResponseInterceptor } from '@shared/infrastructure/http';

// Global Filter (handles all exceptions)
app.useGlobalFilters(new HttpExceptionFilter(logger));

// Global Interceptor (wraps responses in { data, meta })
app.useGlobalInterceptors(new ResponseInterceptor());
```

## Validation Errors

Validation errors from `class-validator` are automatically formatted:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 422,
    "details": [
      { "message": "email must be an email" }
    ]
  }
}
```
