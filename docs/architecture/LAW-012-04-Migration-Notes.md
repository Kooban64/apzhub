# LAW-012-04 — Migration Notes

> **Story:** LAW-012-04 — Document + Task Persistence

---

## New migrations

| Tag                          | File                                                     | Purpose                                        |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `0003_law_document_task`     | `packages/config/drizzle/0003_law_document_task.sql`     | `law_document` + `law_task` tables and indexes |
| `0004_law_document_task_rls` | `packages/config/drizzle/0004_law_document_task_rls.sql` | RLS enable + tenant isolation policies         |

---

## Apply

```bash
pnpm db:migrate
```

Requires `DATABASE_URL` (loaded via project env).

---

## Table creation order

`0003` creates:

1. `law_document` with indexes on `(tenant_id)`, `(tenant_id, matter_id)`, unique `(tenant_id, document_reference)`
2. `law_task` with indexes on `(tenant_id)`, `(tenant_id, matter_id)`, `(tenant_id, document_id)`, unique `(tenant_id, task_reference)`

No database-level foreign keys — relationship integrity enforced in repository adapters (consistent with `law_matter` → `law_client` pattern from LAW-012-02).

---

## Truncate order (tests)

When resetting integration test data:

```
law_outbox_event → law_task → law_document → law_matter → law_client
```

Implemented in `postgres-test-utils.ts` → `truncateLawTables()`.

---

## Verification

`verifyLawMigrations()` now requires all four tags:

- `0001_law_client_matter_outbox`
- `0002_law_rls_policies`
- `0003_law_document_task`
- `0004_law_document_task_rls`

Exposed via `/api/health` → `lawPlatform.persistence.migrationsOk`.

---

## Rollback

No down migrations provided. Rollback is manual `DROP TABLE law_task, law_document CASCADE` plus policy cleanup if needed.
