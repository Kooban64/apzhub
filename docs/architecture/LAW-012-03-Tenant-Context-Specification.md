# LAW-012-03 — Tenant Context Specification

> **Story:** LAW-012-03 — Persistence Hardening  
> **Authority:** [LAW-012-02 Tenant Isolation](./LAW-012-02-Tenant-Isolation-Notes.md)

---

## Resolution chain

```text
Auth session (userId)
        ↓
resolveLawTenantBinding()
        ↓
LawPersistenceContext { tenantId, actorId }
        ↓
Repository factory → Client/Matter adapters
```

---

## Resolution order

| Priority | Source                | `LawTenantSource`              | When                                       |
| -------- | --------------------- | ------------------------------ | ------------------------------------------ |
| 1        | Explicit override     | `explicit`                     | Tests, admin tooling, future firm switcher |
| 2        | Authenticated session | `session-single-firm-fallback` | `userId` present (shell / executor)        |
| 3        | Environment           | `env-override`                 | `LAW_TENANT_ID` set, no session            |
| 4        | Platform default      | `default-firm`                 | Unauthenticated / server bootstrap         |

---

## Development fallback

Auth does **not** yet expose firm/tenant claims. Until auth tenant mapping lands:

- Authenticated users bind to `DEFAULT_LAW_TENANT_ID` (`t0000001-…`)
- `actorId` is populated from session `userId`
- `LAW_TENANT_ID` env override applies only when **no** session user is present

This preserves single-firm dev/UX while keeping a clear upgrade path for multi-tenant auth.

---

## Scope storage

| Mechanism                              | Use                                              |
| -------------------------------------- | ------------------------------------------------ |
| `setSessionLawPersistenceContext()`    | Client shell / executor bundle (browser session) |
| `runWithLawPersistenceContext()` (ALS) | Server request handlers (future API routes)      |
| `getActiveLawPersistenceContext()`     | Repository factory resolution                    |

Session context takes precedence over ALS for client-side wiring.

---

## Key files

- `apps/law-platform/lib/persistence/tenant-resolver.ts`
- `apps/law-platform/lib/persistence/law-persistence-scope.ts`
- `apps/law-platform/app/(platform)/action-workbench-shell-provider.tsx`
- `apps/law-platform/lib/create-app-action-executor.ts`

---

## Future auth integration

When auth exposes `tenantId` (user column, membership table, or JWT claim):

1. Extend `resolveLawTenantBinding()` to read auth tenant before single-firm fallback
2. Add source `session-claim`
3. Remove or gate `session-single-firm-fallback`

No workflow signature changes required.
