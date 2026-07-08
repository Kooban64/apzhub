# LAW-012-03 — RLS Policy Design

> **Tables:** `law_client`, `law_matter`, `law_outbox_event`  
> **Migration:** `packages/config/drizzle/0002_law_rls_policies.sql`

---

## Policy model

Each table uses a single permissive policy scoped to session tenant:

```sql
USING (tenant_id = current_setting('app.tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.tenant_id', true))
```

| Setting         | Set by                         | Scope             |
| --------------- | ------------------------------ | ----------------- |
| `app.tenant_id` | `applyPostgresTenantSession()` | Transaction-local |

RLS is **ENABLED** and **FORCED** on all three law tables.

---

## Application contract

Before any law table read/write inside a transaction:

```typescript
await applyPostgresTenantSession(db, tenantId);
```

Implemented in `runInClientUnitOfWork` / `runInMatterUnitOfWork` (LAW-012-03).

---

## Defense in depth

| Layer       | Mechanism                                        |
| ----------- | ------------------------------------------------ |
| Application | Explicit `tenant_id` filters in adapters         |
| Session     | `set_config('app.tenant_id', …)` per transaction |
| Database    | RLS policies on all law tables                   |

---

## Operational notes

- Migrations must be applied (`0002_law_rls_policies`) — verified via `verifyLawMigrations()`
- Missing `app.tenant_id` session setting → RLS denies all rows (fail closed)
- Table owner is subject to FORCE RLS — no bypass without superuser

---

## Future

- Map auth tenant claim → `app.tenant_id` automatically in connection pool middleware
- Add integration tests asserting cross-tenant denial under RLS (requires postgres + migrations)

---

## Table name reference

Architecture docs may refer to `law_clients` / `law_matters` conceptually. Physical tables use singular names: `law_client`, `law_matter`, `law_outbox_event`.
