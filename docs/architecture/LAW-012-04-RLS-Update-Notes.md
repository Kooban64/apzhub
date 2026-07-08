# LAW-012-04 — RLS Update Notes

> **Story:** LAW-012-04 — Document + Task Persistence  
> **Prerequisite:** [LAW-012-03 RLS Design](./LAW-012-03-RLS-Policy-Design.md)

---

## New policies

Migration `0004_law_document_task_rls.sql`:

| Table          | Policy                          | Rule                                                 |
| -------------- | ------------------------------- | ---------------------------------------------------- |
| `law_document` | `law_document_tenant_isolation` | `tenant_id = current_setting('app.tenant_id', true)` |
| `law_task`     | `law_task_tenant_isolation`     | Same pattern                                         |

Both tables use `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`.

---

## Session binding

Unchanged from LAW-012-03. Every document/task UoW transaction calls `applyPostgresTenantSession()` which executes:

```sql
SELECT set_config('app.tenant_id', $tenantId, true)
```

---

## Policy count verification

`verifyLawMigrations()` checks:

- ≥ 3 policies on `law_client`, `law_matter`, `law_outbox_event` (0002)
- ≥ 2 policies on `law_document`, `law_task` (0004)

---

## Cross-tenant behaviour

Integration tests confirm:

- Tenant A writes are invisible to Tenant B queries
- RLS blocks reads/writes outside `app.tenant_id` session

In-memory mode does **not** enforce tenant isolation (unchanged).

---

## Outbox RLS

`law_outbox_event` policies from 0002 cover document/task outbox rows — same tenant isolation applies to new aggregate types (`document`, `task`).
