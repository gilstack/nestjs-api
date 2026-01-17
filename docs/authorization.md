# Authorization Module

O módulo de autorização utiliza **CASL** para implementar um sistema híbrido de **RBAC** (Role-Based Access Control) e **ABAC** (Attribute-Based Access Control) seguindo os princípios de Domain-Driven Design (DDD).

## Conceitos Chave

### 1. Subjects (Recursos)

Entidades do sistema que podem ser acessadas ou manipuladas. Definidas em `src/modules/authorization/domain/enums/subject.enum.ts`.

Exemplos: `User`, `Announcement`.

### 2. Actions (Ações)

Operações possíveis no sistema. Definidas em `src/modules/authorization/domain/enums/action.enum.ts`.

Exemplos: `create`, `read`, `update`, `delete`, `publish`.

### 3. Policies (Políticas)

Regras de negócio encapsuladas por domínio. Cada módulo define suas próprias políticas, utilizando **Entidades de Domínio** em vez de modelos de ORM diretamente.

Exemplo (`AnnouncementPolicy`):

- **Admin**: Pode gerenciar tudo.
- **Manager**: Pode criar, ler tudo, e atualizar seus próprios anúncios (Delete restrito a Admins).
- **User**: Acesso apenas a rotas públicas (ex: `/active`). Não possui permissões de CRUD na policy.

## Como Usar

### No Controller

Use o decorator `@CheckPolicies` combinado com o helper `Can` ou uma função customizada:

```typescript
import { Controller, Post, Body, Delete, Param } from "@nestjs/common";
import {
  CheckPolicies,
  Can,
} from "@modules/authorization/infrastructure/decorators";
import { Action, Subject } from "@modules/authorization/domain/enums";

@Controller("announcements")
export class AnnouncementController {
  // Opção 1: Verificação simples de Action + Subject
  @Post()
  @CheckPolicies(Can(Action.Create, Subject.Announcement))
  create(@Body() dto: CreateAnnouncementDto) {
    // ...
  }

  // Opção 2: Verificação mais complexa no Service/Use Case
  @Delete(":id")
  @CheckPolicies((ability) => ability.can(Action.Delete, Subject.Announcement))
  async delete(@Param("id") id: string) {
    // Nota: O Guard verifica permissões baseadas no contexto (usuário).
    // Para validações condicionais dependentes do objeto (ex: deletar SE for o dono),
    // a verificação deve ser reforçada no Service/Repository ao buscar o objeto.
  }
}
```

### Global Guard

O `PoliciesGuard` é registrado globalmente como `APP_GUARD` no `AuthorizationModule`. Isso significa que ele intercepta todas as requisições.

- Se a rota tiver `@Public()`, o acesso é permitido (ignora policies).
- Se a rota tiver `@CheckPolicies(...)`, as regras são verificadas.
- **Importante**: Rotas sem decorators `@Public` ou `@CheckPolicies` permitirão acesso a usuários autenticados (Permissive by default for authenticated users). Portanto, **sempre utilize `@CheckPolicies` em rotas de negócio** para garantir segurança.

### No Service / Use Case (Prisma)

Apesar de usarmos `@casl/prisma` na fábrica para compatibilidade de query, o padrão recomendado é usar a `AbilityFactory` para obter as permissões e aplicar filtros manualmente ou via helpers, mantendo o domínio agnóstico.

Entretanto, para queries otimizadas (`accessibleBy`), garanta que o mapeamento de sujeitos esteja correto.

### Adicionando Novas Políticas

1. Crie uma nova classe em `src/modules/authorization/domain/policies/` implementando `IPolicy`.
2. Utilize apenas **Entities** e **Enums** do domínio nos imports.
3. Registre a nova policy na `AbilityFactory`.

```typescript
// src/modules/meu-modulo/domain/policies/meu-modulo.policy.ts
import { User } from "@modules/user/domain/entities";
import { MeuRecurso } from "../../entities/meu-recurso.entity";

export class MeuModuloPolicy implements IPolicy {
  define(builder: AbilityBuilder<AppAbility>, user: User): void {
    const { can } = builder;
    can(Action.Read, Subject.MeuRecurso);
  }
}
```

// ability.factory.ts
// createForUser(user: User): AppAbility {
// // ...
// new MeuModuloPolicy().define(builder, user);
// // ...
// }

```

```
