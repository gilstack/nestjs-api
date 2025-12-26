# API Documentation

The Storagie API provides interactive API documentation powered by **Scalar**, a modern alternative to Swagger UI.

## Accessing the Documentation

When running the server, access the interactive API documentation at:

```
http://localhost:3000/docs
```

## Features

The documentation interface provides:

- **Complete API Reference**: All endpoints with their parameters, request bodies, and responses
- **Request/Response Schemas**: Detailed schema definitions with examples
- **Authentication Requirements**: Clear indication of which endpoints require authentication
- **Try It Out**: Interactive testing of API endpoints directly from the browser
- **Code Generation**: Sample code in multiple programming languages

## Configuration

The Swagger/Scalar setup is configured in `src/shared/infrastructure/documentation/swagger.setup.ts`.

### Document Builder Options

```typescript
const config = new DocumentBuilder()
  .setTitle('Storagie API')
  .setDescription('The Storagie API description')
  .setVersion('1.0')
  .addTag('storagie')
  .addBearerAuth()
  .build();
```

## Adding Documentation to Endpoints

### Controller Level

Use `@ApiTags()` to group endpoints:

```typescript
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {}
```

### Endpoint Level

Use decorators to describe each endpoint:

```typescript
@Post('magic-link')
@ApiOperation({
  summary: 'Request a magic link',
  description: 'Sends a magic link to the provided email.'
})
@ApiOkResponse({ description: 'Magic link sent successfully.' })
@ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
async requestMagicLink(@Body() dto: RequestMagicLinkDto) {}
```

### DTOs

Use `@ApiProperty()` for request/response schemas:

```typescript
export class RequestMagicLinkDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;
}
```

## Available Decorators

| Decorator | Purpose |
|-----------|---------|
| `@ApiTags()` | Groups endpoints in documentation |
| `@ApiOperation()` | Describes endpoint purpose |
| `@ApiProperty()` | Documents DTO properties |
| `@ApiBearerAuth()` | Indicates authentication requirement |
| `@ApiOkResponse()` | Success response documentation |
| `@ApiCreatedResponse()` | 201 response documentation |
| `@ApiNoContentResponse()` | 204 response documentation |
| `@ApiUnauthorizedResponse()` | 401 response documentation |
| `@ApiNotFoundResponse()` | 404 response documentation |

## Best Practices

1. **Always document public-facing endpoints** with meaningful descriptions
2. **Include examples** in `@ApiProperty()` decorators for better developer experience
3. **Use specific response decorators** instead of generic `@ApiResponse()`
4. **Group related endpoints** using `@ApiTags()`
5. **Mark authenticated endpoints** with `@ApiBearerAuth()`
