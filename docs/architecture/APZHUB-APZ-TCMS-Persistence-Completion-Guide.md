# APZ TCMS — Persistence Completion Guide

**Milestone:** APZTCMS-005 — Production Persistence Completion  
**Package:** `@apzhub/testing-persistence` **0.3.0**  
**Date:** 2026-07-12

---

## Purpose

APZTCMS-005 completes the **production PostgreSQL** repository layer for every Manual Testing aggregate introduced through APZTCMS-004. Domain services continue to call `TestingPersistence` only; business behaviour is unchanged.

**Owner brief override:** this milestone is **persistence completion only**. Older backlog wording that listed evidence **binary** upload and HTTP/Workbench delivery under APZTCMS-005 is **superseded** — those remain deferred to a later approved milestone (recommended as APZTCMS-006).

---

## What changed

| Before (004)                                                                                            | After (005)                                                                  |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `createPostgresTestingPersistence` spread an in-memory facade for most aggregates                       | **No in-memory fallback** on the production factory                          |
| Manual execution / case versions / evidence / plans / … SQL tables existed but lacked first-class repos | All `TestingPersistence` keys use Drizzle SQL                                |
| Plan/suite version history and approval history lacked dedicated tables                                 | Migrations `0020` / `0021` add plan/suite version + approval history (+ RLS) |

---

## Production factory contract

```ts
import { createPostgresTestingPersistence } from "@apzhub/testing-persistence";

const persistence = createPostgresTestingPersistence(db);
// Every aggregate is durable SQL — use createInMemoryTestingPersistence() only in unit tests
```

In-memory remains for **tests** and local development without a database. Production paths must not reintroduce the shared in-memory facade.

---

## Aggregate coverage

Mutable CRUD (create / update / archive / restore / get / list / search):

- requirements, workItems, risks
- testPlans, testSuites, testCases, testSteps
- regressionSets, executionSessions, manualExecutions
- evidence (metadata only), approvals
- certificationRecords, releaseReadiness, coverageRecords
- automationDefinitions, traceabilityLinks
- configurations, registryEntries

Append / version repositories:

- `executionHistory` — append / listBySession / get
- `auditRecords` — append / list / get
- `testCaseVersions` — create / get / listByCase
- `testPlanVersions` — create / get / listByPlan
- `testSuiteVersions` — create / get / listBySuite
- `approvalHistory` — append / listByApproval / get

---

## Junctions & dual storage

| Concern                           | Behaviour                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Plan ↔ suite / requirement / risk | Written via junction helpers on plan create/update; loaded on read                                          |
| Suite ↔ case                      | Written on suite write; suite also derives planIds from plan_suite                                          |
| Case ↔ requirement                | Written on case write; case derives suiteIds / stepIds                                                      |
| Risk ↔ requirement                | Written on risk write; requirement.riskIds loaded from junction                                             |
| Manual step actuals               | JSONB on `testing_manual_execution` **and** normalized `testing_manual_step_actual` rows (replace-on-write) |
| Approval history                  | Append-only `testing_approval_history` (+ optional `historyJson` on approval row)                           |

---

## Explicit exclusions (unchanged)

- Workbench UI / HTTP APIs
- Evidence **binary** upload / object storage
- Execution engines / automation runners
- Event Bus / notifications / reports / dashboards / AI

---

## Related docs

- [Repository Guide](./APZHUB-APZ-TCMS-Repository-Guide.md)
- [Schema Guide](./APZHUB-APZ-TCMS-Schema-Guide.md)
- [Schema Update Guide](./APZHUB-APZ-TCMS-Schema-Update-Guide.md)
- [Migration Guide](./APZHUB-APZ-TCMS-Migration-Guide.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md)
- [APZTCMS-005 Completion Report](../sprint/APZTCMS-005-completion-report.md)
