# Authorization and Security Optimization (End-to-End)

This document describes the authorization architecture implemented and how to extend it for maximum performance and security between Frontend and Backend.

## 1. Backend Optimization: Zero Database Hits for AuthN

Currently, your application uses a **Stateless JWT with Rich Payload** strategy.

### How it works today (Already Optimized):

1.  **Login**: When the user logs in, we generate a JWT containing:
    ```json
    {
      "sub": "user_123",
      "role": "MANAGER",  <-- The secret is here
      "email": "manager@storagie.com"
    }
    ```
2.  **Request (Ex: POST /announcements)**:
    - The `JwtCookieStrategy` intercepts the request.
    - It **DOES NOT** go to the database to query the user.
    - It reconstructs a `User` object with only the token data.
3.  **PoliciesGuard**:
    - Receives this `User` (from the token).
    - Verifies the permission. Since the `role` is already there, it decides instantly.

**Result**: If you have 1 million requests per second, you will have 0 database queries to check if the user is ADMIN or MANAGER.

---

## 2. Shared Security: CASL on Frontend

To prevent users from clicking buttons that will fail (403 Forbidden), we share authorization intelligence.

### Proposed Flow (CASL Isomorphic):

1.  **Rules Endpoint (`GET /auth/abilities`)**:
    The backend exposes the user's "raw" rules.

    ```typescript
    // Backend (New Endpoint)
    @Get('abilities')
    getAbilities(@CurrentUser() user: User) {
      const builder = new AbilityBuilder(createMongoAbility);
      // Define only the rules that are needed for the frontend
      AnnouncementPolicy.define(builder, user);
      return builder.rules; // Returns JSON: [{ action: 'create', subject: 'Announcement' }, ...]
    }
    ```

2.  **Frontend (React + CASL Context)**:
    - On application load, the front calls `/auth/abilities`.
    - Initializes the `AbilityContext`.

    ```tsx
    // Component React
    const Can = createContextualCan(AbilityContext.Consumer);

    <Can I="create" a="Announcement">
      <Button>Create Announcement</Button>  <-- Only renders if can
    </Can>
    ```

**Gains**:

- **UX**: User never sees permission error.
- **Performance**: Less requests to the server.
- **Security**: Frontend only "hides", but Backend (Guard) remains the final authority that blocks attacks.

---

## 3. ABAC Optimization (Attribute-Based)

For complex rules ("Edit post IF owner"), we can't avoid fetching the data. But we can optimize _how_ we fetch it.

### Padrão `accessibleBy` (Filtragem no Banco)

Instead of fetching all records and filtering in memory (slow), we use CASL to generate SQL.

**Wrong (Slow):**

```typescript
const announcements = await repo.findAll(); // Busca 10 post
return announcements.filter((a) => ability.can("read", a)); // Filtra na CPU
```

**Right (Fast - Implemented with Prisma):**

```typescript
import { accessibleBy } from "@casl/prisma";

const announcements = await prisma.announcement.findMany({
  where: {
    AND: [
      accessibleBy(ability).Announcement, // Gera SQL: WHERE creatorId = 'user_123'
      { status: "ACTIVE" },
    ],
  },
});
```

This pattern ensures that the database does the heavy lifting of security.

## End-to-End Summary

1.  **Request Login**: User receives HTTP-Only Tokens (XSS Security).
2.  **Request API**:
    - **Step 1 (AuthN)**: JWT Validated in memory (Zero DB).
    - **Step 2 (AuthZ - RBAC)**: Guard verifies Role from token (Zero DB).
    - **Step 3 (AuthZ - ABAC)**: If needs to verify owner, fetches **only** that record or uses `accessibleBy` in WHERE clause.
3.  **Frontend**: Consumes `/auth/abilities` to reflect the same logic visually.

This architecture is **highly scalable** (stateless) and **secure** (backend as source of truth).
