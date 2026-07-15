# APZ TCMS — Schema Guide

**Milestone:** APZTCMS-005 (extends 003/004)  
**Drizzle:** `packages/config/src/db/testing-schema.ts`  
**SQL:** `0016`–`0021` under `packages/config/drizzle/`

---

## Table catalogue (`testing_` prefix)

| Table                           | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `testing_requirement`           | Requirement SoR                                       |
| `testing_work_item`             | Polymorphic Feature/Epic/Story/Task (testing context) |
| `testing_risk`                  | Risk metadata                                         |
| `testing_test_plan`             | Test plan                                             |
| `testing_test_suite`            | Test suite                                            |
| `testing_test_case`             | Test case                                             |
| `testing_test_step`             | Step structure (not results)                          |
| `testing_test_case_version`     | Immutable case version snapshots                      |
| `testing_test_plan_version`     | Immutable plan version snapshots                      |
| `testing_test_suite_version`    | Immutable suite version snapshots                     |
| `testing_plan_suite`            | Junction plan↔suite                                   |
| `testing_suite_case`            | Junction suite↔case                                   |
| `testing_case_requirement`      | Junction case↔requirement                             |
| `testing_plan_requirement`      | Junction plan↔requirement                             |
| `testing_risk_requirement`      | Junction risk↔requirement                             |
| `testing_plan_risk`             | Junction plan↔risk                                    |
| `testing_regression_set`        | Regression campaign set                               |
| `testing_execution_session`     | Session metadata                                      |
| `testing_execution_history`     | Append-only session events                            |
| `testing_manual_execution`      | Manual execution aggregate (+ JSONB step actuals)     |
| `testing_manual_step_actual`    | Normalized step actual rows                           |
| `testing_evidence`              | Evidence metadata / blob refs (no binaries)           |
| `testing_approval`              | Approval decisions                                    |
| `testing_approval_history`      | Append-only approval history                          |
| `testing_certification_record`  | Certification instance                                |
| `testing_release_readiness`     | Readiness assessment                                  |
| `testing_coverage_record`       | Aggregate coverage metadata                           |
| `testing_automation_definition` | Automation definition (not runners)                   |
| `testing_traceability_link`     | Traceability relationships                            |
| `testing_audit_record`          | Immutable audit                                       |
| `testing_configuration`         | Tenant product config JSON                            |
| `testing_registry_entry`        | Optional registry metadata persist                    |

---

## Common columns

- `tenant_id` NOT NULL
- `organisation_id` nullable
- `revision` integer ≥ 1 (mutable aggregates)
- `created_at` / `updated_at`
- `archived_at` soft delete (mutable aggregates)
- Append-only tables omit revision/archive

---

## Explicitly excluded

- Evidence binary blob columns / object-storage payloads
- Runner job queues
- Generic `testing_test_result` engine-outcome table (manual outcomes use manual execution tables)

---

## RLS

`0017`, `0019`, and `0021` enable FORCE RLS with `tenant_id = current_setting('app.tenant_id', true)`. Application code must still filter by tenant.

See [Schema Update Guide](./APZHUB-APZ-TCMS-Schema-Update-Guide.md) for APZTCMS-005 additive detail.
