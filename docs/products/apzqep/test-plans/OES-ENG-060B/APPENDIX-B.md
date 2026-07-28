# APZQEP-OES-ENG-060B — APPENDIX B — Persistence Catalogue (Logical)

## Tables

| Table | Purpose | Key constraints |
| ----- | ------- | --------------- |
| `qep_test_plans` | Aggregate head | PK `id`; UNIQUE `(tenant_id, number)`; `revision` |
| `qep_test_plan_items` | Items | FK `plan_id`; ordered `sequence` |
| `qep_test_plan_approvals` | Approval records | FK `plan_id` |
| `qep_test_plan_revisions` | Sealed snapshots | FK `plan_id`; immutable rows |
| `qep_test_plan_history` | Append-only history | FK `plan_id`; no updates |

## Indexes (minimum)

- Head: `(tenant_id, status)`, `(tenant_id, owner_id)`, `(tenant_id, updated_at DESC)`, `(tenant_id, number)`
- Items: `(plan_id, sequence)`, `(tenant_id, specification_id)`
- History: `(plan_id, occurred_at)`
- Revisions: `(plan_id, revision_number)`

## RLS

All tables: tenant isolation via `app.tenant_id` session setting (Specs pattern).

## Soft-delete

Not used. Terminal statuses: `archived`, `cancelled`, `superseded`.
