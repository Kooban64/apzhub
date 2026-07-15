# APZTCMS-004 — Completion Report

**Milestone:** APZTCMS-004 — Manual Test Management (domain services)  
**Product:** APZ TCMS (APZHUB Test & Certification Management System)  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — expanded contracts/persistence; twelve manual domain services; architecture pack  
**Next:** **APZTCMS-005** (Manual Execution & Evidence) — **awaiting owner approval**

---

## Executive Summary

APZTCMS-004 delivers the **manual testing domain service layer** for APZ TCMS: `@apzhub/testing-contracts` **0.2.0**, `@apzhub/testing-persistence` **0.2.0** (manual execution + case version tables via migrations `0018`/`0019`; in-memory repos), and `@apzhub/testing-services` **0.1.0** with twelve named domain services via `createManualTestingServices`.

**Owner brief override:** this milestone focused on **domain services** (business rules, lifecycle, validation, traceability). Older backlog wording that listed authoring **APIs/UI** under APZTCMS-004 is **superseded** — HTTP APIs and Workbench UI remain deferred (to APZTCMS-005+ as directed). Module remains **disabled**. No Playwright product deps.

---

## Scope delivered

| Area              | Deliverable                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts         | `@apzhub/testing-contracts` **0.2.0** — expanded enums, domain models, named service interfaces                                           |
| Persistence       | `@apzhub/testing-persistence` **0.2.0** — manual execution + case version tables (`0018`/`0019`); in-memory repos for new aggregates      |
| Domain services   | `@apzhub/testing-services` **0.1.0** — 12 services via `createManualTestingServices`                                                      |
| Architecture docs | Manual-Testing-Domain, Service-Architecture, Lifecycle, State-Machines, Validation-Rules, Traceability-Guide (+ Package/Developer guides) |

---

## Packages

### `@apzhub/testing-contracts` 0.2.0

Expanded enums/domain types and named service interfaces for manual testing aggregates (requirements, plans/suites/cases, manual execution, evidence metadata, approvals, traceability, regression, risks, certification preparation, release readiness). Legacy monolithic `TestingService` / `ExecutionService` contracts retained for compatibility.

### `@apzhub/testing-persistence` 0.2.0

| Item             | Detail                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Migrations       | `0018` / `0019` — manual execution + case version SoR tables (+ RLS as applicable)                             |
| Repositories     | In-memory implementations for new aggregates; existing Postgres paths retained for core tables                 |
| Postgres factory | Still falls back to in-memory for aggregates without first-class SQL — **accepted technical debt** (see below) |

**Depends on:** `@apzhub/config`, `@apzhub/platform-authorization`, `@apzhub/testing-contracts`, `drizzle-orm`.

### `@apzhub/testing-services` 0.1.0

Factory: `createManualTestingServices({ persistence, events?, now?, id? })`.

| #   | Service key                | Interface                       |
| --- | -------------------------- | ------------------------------- |
| 1   | `requirements`             | RequirementService              |
| 2   | `testPlans`                | TestPlanService                 |
| 3   | `testSuites`               | TestSuiteService                |
| 4   | `testCases`                | TestCaseService                 |
| 5   | `manualExecutions`         | ManualExecutionService          |
| 6   | `evidence`                 | EvidenceService (metadata only) |
| 7   | `approvals`                | ApprovalService                 |
| 8   | `traceability`             | TraceabilityService             |
| 9   | `regression`               | RegressionService               |
| 10  | `risks`                    | RiskService                     |
| 11  | `certificationPreparation` | CertificationPreparationService |
| 12  | `releaseReadiness`         | ReleaseReadinessService         |

Services own business rules, lifecycle transitions, relationship integrity, and domain-event collection (**no Event Bus publish**).

**Does not own:** HTTP APIs; Workbench UI; binary evidence upload; full certification engine; automation ingestion.

---

## Architecture documentation (APZTCMS-004)

| Document              | Path                                                         |
| --------------------- | ------------------------------------------------------------ |
| Manual Testing Domain | `docs/architecture/APZHUB-APZ-TCMS-Manual-Testing-Domain.md` |
| Service Architecture  | `docs/architecture/APZHUB-APZ-TCMS-Service-Architecture.md`  |
| Lifecycle Guide       | `docs/architecture/APZHUB-APZ-TCMS-Lifecycle-Guide.md`       |
| State Machines        | `docs/architecture/APZHUB-APZ-TCMS-State-Machines.md`        |
| Validation Rules      | `docs/architecture/APZHUB-APZ-TCMS-Validation-Rules.md`      |
| Traceability Guide    | `docs/architecture/APZHUB-APZ-TCMS-Traceability-Guide.md`    |

Package Guide and Developer Guide updated for contracts **0.2.0**, persistence **0.2.0**, services **0.1.0**.

---

## Quality gates (verified)

| Gate                                                                              | Result                                                              |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Typecheck / lint (`testing-contracts`, `testing-persistence`, `testing-services`) | **PASS**                                                            |
| Unit tests (testing packages)                                                     | **74** passed                                                       |
| `testing-services` coverage                                                       | ~**96.45%** lines; lifecycle/validation **100%**; services ~**96%** |
| HTTP / UI / Playwright product                                                    | **None**                                                            |

---

## Explicit exclusions (confirmed)

| Exclusion                                             | Status                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Workbench UI / enabled Testing module                 | **Out of scope** — module remains disabled                                           |
| HTTP authoring / gateway APIs                         | **Deferred** (owner override vs older backlog APIs/UI under 004)                     |
| Evidence **binary** upload / object-storage pipeline  | Deferred to **APZTCMS-005**                                                          |
| Full manual execution UX polish beyond domain service | Deferred to **APZTCMS-005** (domain `ManualExecutionService` already delivered here) |
| Automation result ingestion                           | **APZTCMS-006+**                                                                     |
| Certification state-machine completion / Event Bus    | **Not delivered**                                                                    |
| Playwright / JUnit / Allure as product deps           | **Not delivered**                                                                    |

---

## Owner sections

### What was delivered vs older backlog

| Source                   | Expectation                         | Actual                                                                                 |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Owner brief (004)        | Manual domain **services**          | **Delivered** — `@apzhub/testing-services` **0.1.0** + contracts/persistence expansion |
| Older backlog text (004) | CRUD APIs + basic workbench editors | **Deferred** — owner override; APIs/UI not in this closeout                            |
| Backlog theme (005)      | Manual Execution & Evidence         | Domain `ManualExecutionService` already exists; 005 should not re-build that service   |

### Risks / observations

| Item              | Note                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres coverage | New aggregates (manual execution, case versions, …) have in-memory repos; `createPostgresTestingPersistence` still falls back to in-memory for non-SQL paths — document as debt |
| Module disabled   | Correct — services without enabling product UI                                                                                                                                  |
| Event Bus         | Domain event collector only; no platform bus                                                                                                                                    |
| Evidence          | Metadata service only; no blob storage                                                                                                                                          |

### Technical debt (accepted)

1. **Postgres factory fallback** — remaining / new aggregates without first-class SQL still use the in-memory facade inside `createPostgresTestingPersistence`; expand table coverage incrementally (prefer completing manual-execution Postgres paths in **APZTCMS-005**).
2. **HTTP/UI deferred** — authoring and execution delivery layers not started; do not treat domain services as user-facing until an approved API/UI milestone.

---

## Recommended APZTCMS-005 scope

**Manual Execution & Evidence** (backlog ID unchanged — do not invent new IDs):

1. **Evidence binary pipeline** — upload to S3-compatible object storage; link blobs to evidence metadata already modelled in services
2. **Delivery layer** — HTTP APIs and/or Workbench UX for manual execution & evidence **if owner directs** (004 deferred APIs/UI here)
3. **Postgres completion** — first-class SQL repositories for manual execution (+ related) tables already migrated in 004; remove in-memory fallback for those aggregates
4. **Optional approval hooks** — wire richer sign-off / approval UX on top of existing `ApprovalService` where in scope
5. **Execution polish** — richer execution UX / remaining execution behaviours beyond the domain `ManualExecutionService` already delivered

**Out of scope for 005 (indicative):** automation result ingestion (**006**); full certification engine (**008**); AI; enabling the full Testing module for all capability areas without owner direction.

**Await owner approval** before starting. Record approval in `CURRENT-MILESTONE.md`.

---

## Deliverables checklist

| Deliverable                              | Path / package                                                                                                             | Status |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| Contracts 0.2.0                          | `packages/testing-contracts/`                                                                                              | ✅     |
| Persistence 0.2.0 + migrations 0018/0019 | `packages/testing-persistence/` · `packages/config/drizzle/`                                                               | ✅     |
| Services 0.1.0                           | `packages/testing-services/`                                                                                               | ✅     |
| Architecture pack (004)                  | Manual Domain / Service Arch / Lifecycle / State Machines / Validation / Traceability                                      | ✅     |
| This report                              | `docs/sprint/APZTCMS-004-completion-report.md`                                                                             | ✅     |
| Foundation catalogue updates             | AI-CONTEXT, CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG, catalogues, READMEs, CHANGELOG, SESSION-START, Package Guide | ✅     |

---

## Sign-off

| Gate                                                 | Result   |
| ---------------------------------------------------- | -------- |
| Contracts 0.2.0 + persistence 0.2.0 + services 0.1.0 | **PASS** |
| Typecheck / lint / 74 tests / coverage targets       | **PASS** |
| No HTTP / UI / Playwright product surface            | **PASS** |
| Stop before APZTCMS-005                              | **PASS** |

---

## Related

- [APZTCMS-003 Completion Report](./APZTCMS-003-completion-report.md)
- [APZTCMS-002 Completion Report](./APZTCMS-002-completion-report.md)
- [APZTCMS-001 Completion Report](./APZTCMS-001-completion-report.md)
- [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md)
- [APZTCMS Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md)
- [Service Architecture](../architecture/APZHUB-APZ-TCMS-Service-Architecture.md)
- [Manual Testing Domain](../architecture/APZHUB-APZ-TCMS-Manual-Testing-Domain.md)
- [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)
