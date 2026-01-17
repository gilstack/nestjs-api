# Authorization Rules

## Architecture

1. **Global Module**: The `AuthorizationModule` MUST be `@Global()` and provide the `PoliciesGuard` as `APP_GUARD`.
2. **Domain-Driven**: Policies MUST be defined within the feature module's domain layer (`src/modules/{feature}/domain/policies/`).
3. **Decoupling**: Policies MUST use Domain Entities and Enums (`src/modules/{feature}/domain/entities`, `src/modules/authorization/domain/enums`). NEVER import Prisma Client types in policies.

## Implementation Pattern

### 1. Define Policy

Create a policy class implementing `IPolicy`:

```typescript
// src/modules/feature/domain/policies/feature.policy.ts
import { IPolicy } from "@modules/authorization/domain/policies/policy.interface";
import { AppAbility } from "@modules/authorization/domain/utils/casl-ability.factory";
import { User } from "@modules/user/domain/entities";

export class FeaturePolicy implements IPolicy {
  define(builder: AbilityBuilder<AppAbility>, user: User): void {
    const { can } = builder;
    if (user.role === "ADMIN") {
      can(Action.Manage, Subject.Feature);
    }
  }
}
```

### 2. Protect Controllers

ALL business routes MUST use `@CheckPolicies` to enforce access control. Public routes MUST use `@Public()`.

```typescript
@Controller("features")
export class FeatureController {
  @Get()
  @CheckPolicies(Can(Action.Read, Subject.Feature))
  findAll() {}

  @Post()
  @CheckPolicies(Can(Action.Create, Subject.Feature))
  create() {}

  @Get("public-info")
  @Public()
  getPublicInfo() {}
}
```

### 3. Register in Factory

Register the new policy in `AbilityFactory`:

```typescript
// ability.factory.ts
FeaturePolicy.define(builder, user);
```

## Security Best Practices

1. **Explicit Deny**: Use `cannot()` to explicitly deny sensitive actions (e.g., deleting active records).
2. **Public Routes**: Always verify if a route should truly be `@Public()` or just accessible to `GUEST` role.
3. **Condition Matching**: When using conditions (e.g., `ownerId`), prefer validating in the Service/Repository layer for complex logic, but keep basic RBAC/ABAC inside the Policy.
