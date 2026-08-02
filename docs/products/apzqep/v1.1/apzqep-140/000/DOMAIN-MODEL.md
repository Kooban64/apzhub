# Domain Model — APZQEP-140-000

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZQEP-140-000              |
| Status    | **COMPLETE** (architecture) |
| Timestamp | 20260802T163547Z            |

High-level product domain model. Complements (does not replace) v1.1 [DOMAIN-MODEL.md](../../DOMAIN-MODEL.md). User-facing names only — no backend engine names in UI.

---

## Ownership rules

| Datum                               | System of Record                     |
| ----------------------------------- | ------------------------------------ |
| Suite / Library assets              | Test Management (A)                  |
| Run / Assignment / Session          | Run Management (B)                   |
| Execution / Step results            | Test Execution (C)                   |
| Evidence content & integrity        | Evidence Platform (APZQEP-120)       |
| Defect / Finding                    | Defect Management (D)                |
| Requirement / Relationship          | Requirements & Traceability (E)      |
| Dashboard definitions / saved views | Reporting (F) — config only          |
| Searchable enterprise read model    | Quality Knowledge Index (projection) |
| Identity / permissions              | APZHUB platform                      |

---

## Core entities

### Suite (A)

| Attribute            | Notes                        |
| -------------------- | ---------------------------- |
| suiteId              | Global platform ID           |
| tenantId, projectId  | Isolation                    |
| name, description    |                              |
| version / revision   | Immutable versions preferred |
| status               | Draft → Active → Archived    |
| ownerId              |                              |
| caseRefs             | Ordered case membership      |
| libraryRefs          | Optional shared libraries    |
| tags, classification |                              |

### Library / SharedAsset / ReusableComponent (A)

Reusable packs referenced by suites; never duplicated into run snapshots except by explicit freeze.

### TestRun (B)

| Attribute                 | Notes                                                |
| ------------------------- | ---------------------------------------------------- |
| runId                     |                                                      |
| suiteId (+ suiteRevision) | Frozen suite revision at plan time                   |
| schedule                  | Optional                                             |
| assignments               | user/role/team                                       |
| status                    | Planned → Ready → InProgress → Completed / Cancelled |
| sessionRefs               | Active/historical sessions                           |

### ExecutionSession / Execution (C)

| Attribute               | Notes                                                        |
| ----------------------- | ------------------------------------------------------------ |
| executionId             |                                                              |
| runId, sessionId        |                                                              |
| mode                    | manual \| automated \| hybrid                                |
| status                  | NotStarted → Running → Blocked → Passed \| Failed \| Aborted |
| stepResults             | Outcome per step                                             |
| evidenceLinks           | → Evidence IDs                                               |
| actorId / automationRef |                                                              |

### Evidence (existing)

Owned by Evidence Platform. Execution **links**; does not fork SoR.

### Defect (D)

| Attribute          | Notes                                                  |
| ------------------ | ------------------------------------------------------ |
| defectId           |                                                        |
| severity, priority | Align notification classification where notified       |
| status             | Open → InProgress → Resolved → Closed / Rejected       |
| links              | executionId, runId, suiteId, requirementId, evidenceId |
| riskSignal         | Optional                                               |

### Requirement (E)

Evolve existing Requirements domain. Relationships form the trace graph.

### Coverage / TracePath (E)

Derived where possible; authoritative relationship edges owned by Traceability service.

### ReportDefinition / Dashboard / SavedView (F)

Configuration entities only. Metric values are **derived** from QKI / analytic projections.

---

## Relationships

```text
Project
  └── Suite ──contains──> TestCase / Parameters
        │
        └── referenced by ──> TestRun ──opens──> ExecutionSession
                                      │
                                      └── Execution ──produces──> StepResult
                                            │              └── links ──> Evidence
                                            └── may raise ──> Defect
Suite / Execution / Defect ──trace──> Requirement
All indexable entities ──project──> Quality Knowledge Index
```

---

## Lifecycle summary

| Entity      | Happy path                                |
| ----------- | ----------------------------------------- |
| Suite       | Draft → Active → Archived                 |
| Run         | Planned → Ready → InProgress → Completed  |
| Execution   | NotStarted → Running → Passed/Failed      |
| Defect      | Open → InProgress → Resolved → Closed     |
| Requirement | Draft → Approved → Bas lined / Superseded |

Terminal states are immutable for audit; corrections via supersession or new revisions.

---

## Multi-tenancy

Every entity carries `tenantId`. Project-scoped entities carry `projectId` when applicable. Cross-tenant references are forbidden.
