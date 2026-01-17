# Frontend Authorization Integration (Next.js + CASL)

This guide details how to consume the authorization logic from the Backend in your Next.js project, ensuring that the UI reflects exactly the user's permissions (shared security).

## 1. Installation

Add the CASL libraries responsible for React integration:

```bash
pnpm add @casl/ability @casl/react
```

## 2. Context Configuration (`src/context/UnknownContext.tsx`)

Create a context to provide the ability instance to the entire component tree.

```tsx
// src/context/AbilityContext.tsx
import { createContext } from "react";
import { createContextualCan } from "@casl/react";
import { MongoAbility } from "@casl/ability";

export const AbilityContext = createContext<MongoAbility>(null!);
export const Can = createContextualCan(AbilityContext.Consumer);
```

## 3. Authentication Integration

In your component where you load the user (e.g., `AuthProvider` or `RootLayout` via React Query), you should fetch the rules and update the ability.

```tsx
// Exemplo usando React Query e Ability
import { useQuery } from "@tanstack/react-query";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { AbilityContext } from "./AbilityContext";

export function AuthProvider({ children }) {
  // 1. Fetch user and rules from backend
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: fetchUser });
  const { data: rules = [] } = useQuery({
    queryKey: ["abilities"],
    queryFn: () => ky.get("/api/auth/abilities").json(),
  });

  // 2. Create the CASL instance
  // If no rules (loading/guest), create empty.
  const ability = createMongoAbility(rules);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}
```

## 4. Component Usage

Now you can hide UI elements based on real backend permissions.

### `<Can>` Component

Use the `<Can>` component for declarative conditional rendering.

```tsx
import { Can } from "@/context/AbilityContext";

export function CreateAnnouncementButton() {
  return (
    <Can I="create" a="Announcement">
      <Button>Create Announcement</Button>
    </Can>
  );
}
```

### Hook `useAbility`

For imperative logic or disable buttons instead of hiding.

```tsx
import { useAbility } from "@casl/react";
import { AbilityContext } from "@/context/AbilityContext";

export function EditButton({ announcement }) {
  const ability = useAbility(AbilityContext);

  const canEdit = ability.can("update", announcement); // Checks ABAC (owner)

  return <Button disabled={!canEdit}>Edit</Button>;
}
```

## Summary of Flow

1. **Backend**: Exposes rules in `/auth/abilities`.
2. **Frontend**:
   - Fetches rules on login.
   - Hydrates the `createMongoAbility`.
   - Provides via `AbilityContext`.
   - Components use `<Can>` to verify.

This ensures that your Frontend is "Dumb" (just follows rules) and your Backend is "Smart" (defines rules), maintaining centralized security and responsive UI.
