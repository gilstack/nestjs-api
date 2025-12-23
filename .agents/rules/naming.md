# Naming Conventions

## Files

| Type | Pattern | Example |
|------|---------|---------|
| Module | `{name}.module.ts` | `user.module.ts` |
| Service | `{name}.service.ts` | `user.service.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| Interface | `{name}.interface.ts` | `cache.interface.ts` |
| DTO | `{action}-{name}.dto.ts` | `create-user.dto.ts` |
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Repository | `{name}.repository.ts` | `user.repository.ts` |
| Use Case | `{action}-{name}.use-case.ts` | `create-user.use-case.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |
| Config | `{name}.config.ts` | `database.config.ts` |
| Processor | `{name}.processor.ts` | `email.processor.ts` |

## Classes

| Type | Pattern | Example |
|------|---------|---------|
| Module | `{Name}Module` | `UserModule` |
| Service | `{Name}Service` | `UserService` |
| Controller | `{Name}Controller` | `UserController` |
| Interface | `I{Name}` | `ICacheService` |
| DTO | `{Action}{Name}Dto` | `CreateUserDto` |
| Entity | `{Name}` | `User` |
| Repository Interface | `I{Name}Repository` | `IUserRepository` |
| Repository Impl | `{Impl}{Name}Repository` | `PrismaUserRepository` |
| Use Case | `{Action}{Name}UseCase` | `CreateUserUseCase` |

## Tokens

| Type | Pattern | Example |
|------|---------|---------|
| Infrastructure | `{NAME}_SERVICE` | `CACHE_SERVICE` |
| Repository | `REPOSITORY_TOKENS.{NAME}` | `REPOSITORY_TOKENS.USER` |

## Variables

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use SCREAMING_SNAKE_CASE for constants and tokens
- Prefix private properties with nothing (TypeScript private keyword only)
- Prefix interfaces with `I` only for service contracts

## Cache Keys

Pattern: `{entity}:{id}:{relation}`

Examples:
- `user:123`
- `user:123:posts`
- `user:list:active`

## Queue Names

Pattern: lowercase, singular noun

Examples:
- `email`
- `notification`
- `report`

## Job Names

Pattern: `{entity}.{action}` or `{action}`

Examples:
- `user.created`
- `order.completed`
- `send`
- `process`
