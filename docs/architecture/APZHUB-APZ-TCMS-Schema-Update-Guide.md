# APZ TCMS — Schema Update Guide

**Milestone:** APZTCMS-005  
**Source of truth:** `packages/config/src/db/testing-schema.ts`

---

## Additive tables (0020)

| Table                        | Purpose                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `testing_test_plan_version`  | Immutable plan version snapshots (`plan_id` + `version_number`)   |
| `testing_test_suite_version` | Immutable suite version snapshots (`suite_id` + `version_number`) |
| `testing_approval_history`   | Append-only approval decision history events                      |

No redesign of existing tables. Prior manual-execution tables (`testing_manual_execution`, `testing_manual_step_actual`, `testing_test_case_version`) remain from APZTCMS-004 (`0018`/`0019`).

---

## Shared conventions

- `tenant_id` NOT NULL on every row
- Mutable entities: `revision`, `created_at` / `updated_at`, `archived_at`
- Version tables: unique `(tenant_id, {plan|suite|case}_id, version_number)`
- Append-only history: no soft-delete / revision
- CHECK constraints for reason / status enums match contracts

---

## RLS (0021)

`0021_apz_tcms_persistence_completion_rls.sql` ENABLE/FORCE RLS + tenant policies for the three new tables:

```sql
tenant_id = current_setting('app.tenant_id', true)
```

Application repositories still filter by `ctx.tenantId` (defense in depth).

---

## Compatibility

- Existing APZTCMS-003/004 tables unchanged by 0020 (CREATE only)
- Domain services consume the same record shapes; new repos are additive surface
- Evidence remains **metadata** (`storage_ref`, checksum, mime, size, URI placeholder) — no blob columns

See [Schema Guide](./APZHUB-APZ-TCMS-Schema-Guide.md) for the full catalogue.
