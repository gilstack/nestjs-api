# Architecture Rules

## Dependency Inversion Principle

All infrastructure services MUST follow this pattern:

1. Define an interface in `interfaces/` folder
2. Create a Symbol token in `src/shared/constants/injection-tokens.ts`
3. Implement the interface in a concrete class
4. Bind using the token in the module

## Required Pattern

```typescript
// 1. Interface
// Location: src/shared/infrastructure/{layer}/interfaces/{name}.interface.ts
export interface IServiceName {
  methodName(): Promise<ReturnType>;
}

// 2. Token
// Location: src/shared/constants/injection-tokens.ts
export const SERVICE_NAME = Symbol('SERVICE_NAME');

// 3. Implementation
// Location: src/shared/infrastructure/{layer}/{impl}/{impl}-{name}.service.ts
@Injectable()
export class ConcreteServiceName implements IServiceName {
  async methodName(): Promise<ReturnType> {
    // implementation
  }
}

// 4. Module binding
// Location: src/shared/infrastructure/{layer}/{layer}.module.ts
@Global()
@Module({
  providers: [
    {
      provide: SERVICE_NAME,
      useClass: ConcreteServiceName,
    },
  ],
  exports: [SERVICE_NAME],
})
export class LayerModule {}
```

## Injection in Services

Always inject using the token and interface type:

```typescript
constructor(
  @Inject(SERVICE_NAME) private readonly service: IServiceName,
) {}
```

NEVER inject concrete implementations directly unless required for implementation-specific features.

## Module Structure

Each infrastructure module MUST be:

1. Decorated with `@Global()` for app-wide availability
2. Export only the token, not the implementation class
3. Self-contained with its own interfaces and implementations

## Configuration Access

Always use `TypedConfigService` for configuration:

```typescript
constructor(private readonly config: TypedConfigService) {
  const value = this.config.app.port; // Full autocomplete
}
```

NEVER use `process.env` directly in services.

## Feature Modules Structure

Feature modules should follow this structure:

```
src/modules/{feature}/
├── {feature}.module.ts
├── domain/
│   ├── entities/
│   └── repositories/        # Interface definitions
├── application/
│   ├── use-cases/
│   ├── services/
│   └── dtos/
└── infrastructure/
    ├── controllers/
    ├── repositories/        # Implementations
    ├── guards/              # Auth guards
    ├── decorators/          # Custom decorators
    ├── strategies/          # Passport strategies
    └── mappers/
```

## Authentication Pattern

Authentication is **Global by Default**.

- All routes are protected by default (require valid Access Token)
- Use `@Public()` decorator to bypass authentication

```typescript
// Public Endpoint
@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  login() {
    // ...
  }
}

// Protected Endpoint (Default)
@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@CurrentUser() user: RequestUser) {
    // ...
  }
}
```

