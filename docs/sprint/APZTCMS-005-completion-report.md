# APZTCMS-005 — Completion Report

**Milestone:** APZTCMS-005 — Production Persistence Completion  
**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — all Manual Testing aggregates on production PostgreSQL repositories; migrations `0020`/`0021`; package **0.3.0**  
**Next:** **APZTCMS-006** — **awaiting owner approval**

---

## Executive Summary

APZTCMS-005 completes the durable persistence layer for APZ TCMS Manual Testing. `@apzhub/testing-persistence` **0.3.0** wires **every** `TestingPersistence` aggregate to PostgreSQL via Drizzle. The production factory **no longer** falls back to in-memory. Domain services (`@apzhub/testing-services` **0.1.0**) are unchanged in behaviour and continue to consume repository interfaces only.

**Owner brief override:** this milestone is **persistence completion only**. Older backlog text that listed evidence **binary** upload and HTTP/Workbench delivery under APZTCMS-005 is **superseded**. Module remains **disabled**. No Playwright product deps.

---

## Business Services

No new domain services. Existing twelve services from APZTCMS-004 operate against production repositories when wired with `createPostgresTestingPersistence(db)`.

---

## Repositories completed

| Surface                                                 | Postgres                |
| ------------------------------------------------------- | ----------------------- |
| requirements, workItems, risks                          | ✅                      |
| testPlans, testSuites, testCases, testSteps             | ✅ (+ junction sync)    |
| testCaseVersions, testPlanVersions, testSuiteVersions   | ✅                      |
| regressionSets, executionSessions, manualExecutions     | ✅ (+ step-actual sync) |
| executionHistory, auditRecords, approvalHistory         | ✅                      |
| evidence (metadata), approvals                          | ✅                      |
| certificationRecords, releaseReadiness, coverageRecords | ✅                      |
| automationDefinitions, traceabilityLinks                | ✅                      |
| configurations, registryEntries                         | ✅                      |

Shared: `generic-crud.ts`, `junctions.ts`, full `row-mappers.ts`.

---

## Schema additions

| Table                        | Role                         |
| ---------------------------- | ---------------------------- |
| `testing_test_plan_version`  | Plan version snapshots       |
| `testing_test_suite_version` | Suite version snapshots      |
| `testing_approval_history`   | Append-only approval history |

Existing 0016–0019 tables retained (no redesign).

---

## Migrations

| File                                           | Role                                 |
| ---------------------------------------------- | ------------------------------------ |
| `0020_apz_tcms_persistence_completion.sql`     | CREATE new tables / indexes / CHECKs |
| `0021_apz_tcms_persistence_completion_rls.sql` | ENABLE/FORCE RLS + tenant policies   |

Journal idx **20** / **21**.

---

## Services updated

- No business-rule changes in `@apzhub/testing-services`
- Production wiring: inject `createPostgresTestingPersistence(db)` instead of in-memory
- In-memory factory retained for unit tests (expanded for new version/history repos)

---

## Validation / History / Version / Traceability / Evidence

| Area         | Persistence                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Validation   | Existing persistence validators unchanged; state still enforced in services                       |
| History      | `executionHistory`, `approvalHistory`, `auditRecords` append-only SQL                             |
| Versioning   | Case / plan / suite version tables                                                                |
| Traceability | `traceabilityLinks` + junction tables for plan/suite/case/risk/requirement                        |
| Evidence     | Metadata columns only (`storage_ref`, checksum, mime, size, url, relationships) — **no binaries** |

---

## Tests

| Suite                                                              | Result                                     |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `@apzhub/testing-persistence`                                      | **62** passed                              |
| Testing packages (contracts + foundation + persistence + services) | **108** passed                             |
| Boundary                                                           | No runner/UI imports in persistence `src/` |

---

## Coverage (`testing-persistence`)

| Area                  | Lines       |
| --------------------- | ----------- |
| Overall package       | **~92.45%** |
| Postgres folder       | **~97.13%** |
| Mappers               | **100%**    |
| Validation            | **100%**    |
| Postgres generic-crud | **~98.52%** |
| Junctions             | **100%**    |

(In-memory factory remains lightly exercised relative to Postgres — intentional; production path is SQL.)

---

## Quality Gates

| Gate                    | Result                                                 |
| ----------------------- | ------------------------------------------------------ |
| lint                    | **PASS**                                               |
| typecheck               | **PASS**                                               |
| tests                   | **PASS** (108 testing-pack)                            |
| coverage                | Postgres / validation / mappers meet ≥95% line targets |
| migrations              | `0020`/`0021` + journal                                |
| architecture / boundary | **PASS** (no HTTP/UI/engine deps)                      |

No service regressions observed.

---

## Remaining technical debt

1. **No live-DB integration suite** — Postgres repos covered with mocked Drizzle executors; recommend a smoke migration + CRUD suite against a real Postgres in a later milestone
2. **Evidence binary pipeline** — metadata SoR only; object storage deferred
3. **HTTP APIs / Workbench UI** — deferred
4. **Requirement `ownerId`** — present on record; no dedicated column (optional field may not round-trip SQL)
5. **Event Bus** — still domain collector only

---

## Recommended APZTCMS-006 scope

**Manual Execution & Evidence delivery** (absorbing delivery themes formerly listed under older APZTCMS-005 backlog wording):

1. Evidence **binary** upload to object storage + durable `storage_ref` binding
2. HTTP API / Workbench delivery **if owner directs**
3. Optional live-Postgres repository integration tests
4. Do **not** start automation result ingestion, certification engine, or AI without further approval

Await explicit owner approval before starting APZTCMS-006.

---

## Deliverable checklist

| Item                                               | Path                                                                | Status |
| -------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| Persistence **0.3.0**                              | `packages/testing-persistence/`                                     | ✅     |
| Migrations 0020/0021                               | `packages/config/drizzle/`                                          | ✅     |
| Schema tables                                      | `packages/config/src/db/testing-schema.ts`                          | ✅     |
| Persistence Completion Guide                       | `docs/architecture/APZHUB-APZ-TCMS-Persistence-Completion-Guide.md` | ✅     |
| Repository / Schema / Migration / Developer guides | `docs/architecture/`                                                | ✅     |
| Completion report                                  | this file                                                           | ✅     |
