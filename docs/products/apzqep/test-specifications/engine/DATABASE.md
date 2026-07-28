# Database — APZQEP-ENG-050B

## Migrations

| Migration | Purpose |
| --------- | ------- |
| `0083_apz_qep_test_specifications.sql` | Tables + indexes |
| `0084_apz_qep_test_specifications_rls.sql` | Row Level Security |

## Tables

| Table | Role |
| ----- | ---- |
| `qep_test_specifications` | Aggregate SoR |
| `qep_test_specification_versions` | Version lineage index |
| `qep_test_specification_relationships` | Reference-only relationships |
| `qep_test_specification_history` | Append-only history |

Every table includes `tenant_id`, audit timestamps/actors, and `revision` (optimistic concurrency on the aggregate).

## RLS

Policies isolate rows with `tenant_id = current_setting('app.tenant_id', true)` via `applyPostgresTenantSession`.

## Drizzle schema

`packages/config/src/db/qep-test-specifications-schema.ts` — exported from `@apzhub/config`.
