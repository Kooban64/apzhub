# Tenant Isolation — APZQEP-152

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-152       |
| Artefact  | TENANT-ISOLATION |
| Timestamp | 20260803T064000Z |

---

## Session tenant binding

| Control            | Behaviour                                                                            |
| ------------------ | ------------------------------------------------------------------------------------ |
| Source of tenant   | Validated Better Auth session only (`tenantId` / `user.tenantId` / `activeTenantId`) |
| Client body/header | Not trusted for tenant selection on Cap HTTP path                                    |
| Service context    | `buildServiceRequestContext` requires session tenant; throws if missing              |
| Actor              | Cap `actorFromContext` copies `serviceContext.tenantId`                              |

Cross-tenant HTTP spoofing via request body is blocked by session binding.

## Cap TX / RLS wiring

```text
withPlatformApiAuth
  → runWithTenantContext(serviceContext.tenantId, handler)
       └─ Cap domain → runInDatabaseTransaction
            └─ applyPostgresTenantSession(tx|db, tenantId)
                 └─ set_config('app.tenant_id', tenantId, true)
```

| Component          | Location                                                                           |
| ------------------ | ---------------------------------------------------------------------------------- |
| Request tenant ALS | `runWithTenantContext` — `packages/config/src/db/transaction-context.ts`           |
| TX + GUC           | `runInDatabaseTransaction` — same file                                             |
| Session GUC helper | `applyPostgresTenantSession` — `packages/config/src/db/postgres-tenant-session.ts` |
| Schema             | Cap FORCE RLS on `app.tenant_id` (APZQEP-151 / migration 0096 lineage)             |

## Defense in depth

1. Session-bound tenant on actor
2. Repository `eq(tenantId, …)` filters where implemented
3. PostgreSQL FORCE RLS when `app.tenant_id` is set on the Cap TX path

Discovery risk “Cap RLS session wiring NOT WIRED” is remediated for Cap TX path under APZQEP-152.
