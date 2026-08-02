# PostgreSQL Schema

## Migrations

- `0095_apz_qep_core_qe_persistence.sql` — Cap A–F tables + idempotency
- `0096_apz_qep_core_qe_persistence_rls.sql` — tenant RLS

## Tables

- `qep_suite`
- `qep_execution_plan`
- `qep_execution_session`
- `qep_defect`
- `qep_enterprise_requirement`
- `qep_saved_report`
- `qep_reporting_trend_sample`
- `qep_core_qe_idempotency`

## Common columns

id, tenant_id, project_id (where applicable), revision, created_at, created_by, updated_at, updated_by, lifecycle/status fields, history_json where used for governed history.

JSONB used for aggregate payloads and governed extension metadata; indexed scalar columns support list/filter/concurrency.

Drizzle: `packages/config/src/db/qep-core-qe-schema.ts`
