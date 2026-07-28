# Database — APZQEP-ENG-060B

## Migrations

| Migration                         | Purpose            |
| --------------------------------- | ------------------ |
| `0085_apz_qep_test_plans.sql`     | Tables + indexes   |
| `0086_apz_qep_test_plans_rls.sql` | Row Level Security |

## Tables

| Table                     | Role                                     |
| ------------------------- | ---------------------------------------- |
| `qep_test_plans`          | Aggregate SoR                            |
| `qep_test_plan_items`     | Plan item lines (sequenced)              |
| `qep_test_plan_approvals` | Approval decisions                       |
| `qep_test_plan_revisions` | Revision/version lineage index           |
| `qep_test_plan_history`   | Append-only history (sequenced per plan) |

Every table includes `tenant_id`, audit timestamps/actors, and the aggregate carries `revision` (optimistic concurrency). `qep_test_plans` has a unique index on `(tenant_id, number)`; `qep_test_plan_history` has a unique index on `(tenant_id, plan_id, sequence)`.

## RLS

Policies isolate rows with `tenant_id = current_setting('app.tenant_id', true)` via `applyPostgresTenantSession`.

## Drizzle schema

`packages/config/src/db/qep-test-plans-schema.ts` — exported from `@apzhub/config`.
