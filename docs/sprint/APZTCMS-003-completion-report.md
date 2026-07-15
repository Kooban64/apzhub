# APZTCMS-003 — Completion Report

**Milestone:** APZTCMS-003 — Domain Persistence & Permissions  
**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — SoR schema, migrations, repositories, live authz wiring  
**Next:** **APZTCMS-004** (Manual Test Management) — **awaiting owner approval**

---

## Executive Summary

APZTCMS-003 delivers the **domain persistence and permissions foundation** for APZ TCMS: platform PostgreSQL schema (`testing_*`), Drizzle migrations with RLS, `@apzhub/testing-persistence` **0.1.0** (in-memory + Postgres repositories, authz asserts, validation), and Platform Authorization namespaces/wildcards for testing/certification/evidence and related domains.

**Still no product runtime UI or HTTP APIs.** No execution-result / step-outcome tables. No Playwright/JUnit/Allure product dependencies. Module remains **disabled**.

---

## Scope delivered

| Area                | Deliverable                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SoR schema          | `packages/config/src/db/testing-schema.ts` + exports from `packages/config/src/db/index.ts`                                                            |
| Migrations          | `packages/config/drizzle/0016_apz_tcms.sql`, `0017_apz_tcms_rls.sql`; journal idx 16/17                                                                |
| Persistence package | `@apzhub/testing-persistence` **0.1.0** — repos (in-memory + postgres), authz, validation, mappers                                                     |
| Platform authz      | Canonical namespaces + default seed wildcards (`testing.*`, `certification.*`, `evidence.*`, …)                                                        |
| Architecture docs   | Persistence Architecture, Schema Guide, Repository Guide, Authorization Guide, Migration Guide (present; Package/Developer guides updated on closeout) |

---

## Packages

### `@apzhub/testing-persistence` 0.1.0

| Export surface       | Contents                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Factories            | `createInMemoryTestingPersistence`, `createPostgresTestingPersistence`                       |
| Authz                | `assertPermission`, `OPERATION_PERMISSION_MAP`, `seedTestingPermissions`, seed key helpers   |
| Validation           | Tenant/org/revision checks; domain enum validators                                           |
| Errors               | Typed `PersistenceError` (`NOT_FOUND`, `REVISION_CONFLICT`, `UNAUTHORIZED`, `VALIDATION`, …) |
| Mappers              | Row ↔ record helpers for core SoR tables                                                     |
| Records / interfaces | Aggregate CRUD + append-only history/audit contracts                                         |

**Depends on:** `@apzhub/config`, `@apzhub/platform-authorization`, `@apzhub/testing-contracts`, `drizzle-orm`.  
**Does not own:** HTTP APIs; Workbench UI; service orchestration; execution engines; result outcome tables.

### Schema (`@apzhub/config`)

| Item           | Path / note                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| Drizzle tables | `packages/config/src/db/testing-schema.ts` (`testing_` prefix)                   |
| DDL            | `0016_apz_tcms.sql` — CREATE TABLE + indexes + CHECKs                            |
| RLS            | `0017_apz_tcms_rls.sql` — ENABLE/FORCE RLS + tenant policies via `app.tenant_id` |

Core entities include requirements, risks, plans/suites/cases/steps, junctions, evidence metadata, certification/approval/coverage/automation/traceability metadata, audit, configuration — **not** TestResult / step-result outcome tables.

---

## Platform authorization

| Item             | Detail                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespaces       | `testing`, `certification`, `evidence`, `traceability`, `automation`, `reporting`, `approval`, `dashboard` in `CANONICAL_PERMISSION_NAMESPACES` |
| Seed wildcards   | Matching `*.` wildcards in default authorization seed                                                                                           |
| Repository layer | Specific permission keys per aggregate/operation; wildcards match via `permissionPatternMatches`; **no** allow-all bypass                       |

---

## Architecture documentation (APZTCMS-003)

| Document                 | Path                                                            |
| ------------------------ | --------------------------------------------------------------- |
| Persistence Architecture | `docs/architecture/APZHUB-APZ-TCMS-Persistence-Architecture.md` |
| Schema Guide             | `docs/architecture/APZHUB-APZ-TCMS-Schema-Guide.md`             |
| Repository Guide         | `docs/architecture/APZHUB-APZ-TCMS-Repository-Guide.md`         |
| Authorization Guide      | `docs/architecture/APZHUB-APZ-TCMS-Authorization-Guide.md`      |
| Migration Guide          | `docs/architecture/APZHUB-APZ-TCMS-Migration-Guide.md`          |

Reference Architecture and Foundation Architecture updated with a brief note that persistence exists; product UI/APIs/runners remain out of scope.

---

## Quality gates (verified)

| Gate                                                   | Result                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Typecheck / lint (`testing-persistence`)               | **PASS**                                                                              |
| Typecheck (`platform-authorization`)                   | **PASS**                                                                              |
| Unit tests (TCMS + authz slice)                        | **61** passed (testing-persistence + contracts + foundation + platform-authorization) |
| `testing-persistence` alone                            | **28** tests                                                                          |
| Coverage (`testing-persistence`)                       | ~**95.27%** lines/stmts; branches ~**51%**; funcs ~**92%**                            |
| UI / execution-result tables / Playwright product deps | **None**                                                                              |

---

## Explicit exclusions (confirmed — still hold)

| Exclusion                                                               | Status                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| Workbench UI / enabled Testing module                                   | **Out of scope** — module remains disabled; no routes |
| HTTP APIs / gateway handlers / authoring editors                        | Deferred to **APZTCMS-004+**                          |
| Full manual / automation runners                                        | **Not delivered**                                     |
| Execution-result / step-outcome SoR tables                              | **Explicitly excluded**                               |
| Result adapters (Vitest/Playwright/JUnit/Allure as product deps)        | **Not delivered**                                     |
| Evidence blob upload pipelines                                          | Metadata only in SoR                                  |
| Event Bus / notifications / AI / certification state-machine completion | **Not delivered**                                     |
| CI runners owned by TCMS                                                | **Not delivered**                                     |

---

## Risks / observations

| Item              | Note                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Postgres coverage | First-class SQL paths for a subset of aggregates; others share in-memory facade until expanded — prefer in-memory for unit tests |
| Branch coverage   | ~51% branches on persistence package; accepted for foundation closeout                                                           |
| Module disabled   | Correct — persistence without enabling product UI                                                                                |
| Thin services     | No full `TestingServiceImpl` / Certification engine in this milestone                                                            |

---

## Technical debt

Accepted incremental Postgres expansion for remaining aggregates; no new architectural debt beyond planned APZTCMS-004 authoring surface.

---

## Recommended APZTCMS-004 scope

**Manual Test Management** (per backlog — authoring APIs/editors; **still no full runners**):

1. **CRUD APIs** — Gateway-facing authoring for TestPlan, TestSuite, TestCase, TestStep (and related requirement/risk links as needed), backed by `@apzhub/testing-persistence`
2. **Basic workbench editors** — Minimal permission-driven editors for plans/suites/cases/steps (not full Certification/Dashboard suite)
3. **Search provider registration** — Register cases/plans with Platform Search (020) where in scope
4. **Thin Platform Service shells** — Orchestration + authz + audit using persistence; still no full execution UX

**Out of scope for 004 (indicative):** full manual execution runner; evidence blob upload pipelines; automation result ingestion; enabling the full Testing module for all capability areas; certification state-machine completion; AI.

**Await owner approval** before starting. Record approval in `CURRENT-MILESTONE.md`.

---

## Deliverables checklist

| Deliverable                      | Path / package                                                                                              | Status |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| Testing schema                   | `packages/config/src/db/testing-schema.ts` (+ db index exports)                                             | ✅     |
| Migrations 0016/0017             | `packages/config/drizzle/` + journal                                                                        | ✅     |
| Persistence package              | `packages/testing-persistence/` @ **0.1.0**                                                                 | ✅     |
| Platform authz namespaces + seed | `@apzhub/platform-authorization`                                                                            | ✅     |
| Architecture pack (003)          | Persistence / Schema / Repository / Authorization / Migration guides                                        | ✅     |
| This report                      | `docs/sprint/APZTCMS-003-completion-report.md`                                                              | ✅     |
| Foundation catalogue updates     | AI-CONTEXT, CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, catalogues, READMEs, CHANGELOG, SESSION-START | ✅     |

---

## Sign-off

| Gate                                                                     | Result   |
| ------------------------------------------------------------------------ | -------- |
| Schema + migrations + RLS present                                        | **PASS** |
| `@apzhub/testing-persistence` 0.1.0                                      | **PASS** |
| Typecheck / lint / 61 tests / coverage targets                           | **PASS** |
| No UI / APIs / runners / execution-result tables / forbidden engine deps | **PASS** |
| Stop before APZTCMS-004                                                  | **PASS** |

---

## Related

- [APZTCMS-002 Completion Report](./APZTCMS-002-completion-report.md)
- [APZTCMS-001 Completion Report](./APZTCMS-001-completion-report.md)
- [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md)
- [APZTCMS Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md)
- [Persistence Architecture](../architecture/APZHUB-APZ-TCMS-Persistence-Architecture.md)
- [Repository Guide](../architecture/APZHUB-APZ-TCMS-Repository-Guide.md)
- [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)
