# LAW-012-02 — Tenant Isolation Notes

## Design

Every persisted Client and Matter row carries `tenant_id`. PostgreSQL adapters inject `tenantId` from `LawPersistenceContext` on all reads and writes.

| Concern              | Implementation                                                                     |
| -------------------- | ---------------------------------------------------------------------------------- |
| Tenant source        | `LawPersistenceContext.tenantId`                                                   |
| Default tenant       | `t0000001-0000-4000-8000-000000000001`                                             |
| Override             | `LAW_TENANT_ID` environment variable                                               |
| Read filter          | All SELECT queries include `tenant_id = context.tenantId`                          |
| Write scope          | All INSERT/UPDATE include `tenant_id` from context                                 |
| Reference uniqueness | `(tenant_id, client_reference)` and `(tenant_id, matter_reference)` unique indexes |

## Memory mode

In-memory repositories do **not** enforce tenant isolation — they remain single-firm session stores as validated in LAW-002 through LAW-011. Tenant scoping applies only when `LAW_REPOSITORY_MODE=postgres`.

## Tests

`postgres-client-repository.integration.test.ts` includes a tenant isolation test:

- Tenant A creates a client
- Tenant B cannot `getById` or `list` that client

## Future: RLS

LAW-012-01 recommends PostgreSQL Row Level Security. **Not implemented in LAW-012-02.** Application-level tenant filtering is enforced in adapters. RLS policies are deferred to LAW-012-03+ when session tenant binding is established.

## Multi-tenant singleton note

`getShared*Repository()` uses a single default tenant context. Multi-tenant request scoping (per-session tenant from auth) is **technical debt TD-P02** — inject `LawPersistenceContext` per request in a future story.
