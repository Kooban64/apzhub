# APZTCMS-006 — Completion Report

**Milestone:** APZTCMS-006 — Manual Execution & Evidence Domain Engine  
**Product:** APZ TCMS  
**Date:** 2026-07-12  
**Outcome:** **COMPLETE** — production domain engine for manual execution, steps, evidence lifecycle, approvals, history  
**Next:** **APZTCMS-007** — **awaiting owner approval**

---

## Executive Summary

APZTCMS-006 delivers the **authoritative manual execution & evidence domain engine**. `@apzhub/testing-contracts` **0.3.0**, `@apzhub/testing-persistence` **0.4.0** (migration `0022`), and `@apzhub/testing-services` **0.2.0** implement formal state machines, step execution, evidence lifecycle with abstract storage, multi-stage approvals, and immutable execution history.

**Owner brief override:** this milestone is **domain engine only**. Older backlog wording that listed evidence binary cloud upload and HTTP/Workbench delivery under APZTCMS-006 is **superseded**. Module remains **disabled**. No Playwright/automation product deps.

---

## Execution Engine

`ManualExecutionService` supports create → assign → start → pause/resume → block → complete → submitForReview → approve/reject → reopen → restart → cancel → archive/restore. All transitions validated; illegal paths fail safely.

## State Machine

Canonical statuses: draft, assigned, ready, in_progress, paused, blocked, completed, under_review, approved, rejected, cancelled, archived. Legacy aliases canonicalize (`planned`→`draft`, `aborted`→`cancelled`, etc.).

## Evidence Engine

Metadata lifecycle + `EvidenceStorageProvider`. Default `InMemoryEvidenceStorageProvider`. `ObjectStorageProvider` contract via unimplemented stub — **no** S3/MinIO/Azure.

## Approval Engine

Cert- and execution-bound approvals with roles, rework, history, and optional multi-stage `execution.approvalStages`.

## History Model

Immutable `executionHistory` appends on transitions, assignments, step/evidence/approval events + in-process `DomainEventCollector` (no Event Bus).

## Traceability

Existing `TraceabilityService` plus execution↔evidence↔approval relationships; readiness inputs enriched (pass/fail/blocked %, missing evidence/approvals).

## Validation

Domain validation for transitions, evidence lifecycle, approvals, assignment, permissions (via persistence authz), tenant/org isolation, revision integrity.

## Repository Changes

| Item        | Detail                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Persistence | **0.4.0**                                                                                                                 |
| Migration   | `0022_apz_tcms_execution_engine.sql` — status CHECKs, evidence lifecycle columns, approval stages, step nest/param fields |
| Schema      | Additive columns; no redesign                                                                                             |

## Tests

| Suite                | Count   |
| -------------------- | ------- |
| testing-services     | **80**  |
| All testing packages | **167** |

Coverage engines: lifecycle, execution, step, evidence, approval, history unit suites.

## Coverage (`testing-services`)

| Area                       | Lines       |
| -------------------------- | ----------- |
| Overall                    | **~95.63%** |
| Lifecycle / state machines | **~95.9%**  |
| Manual execution service   | **~97.7%**  |
| Evidence service           | **~96.4%**  |
| Storage                    | **~98.5%**  |
| Validation                 | **100%**    |
| Approval service           | **~93.6%**  |

## Quality Gates

| Gate                  | Result                                      |
| --------------------- | ------------------------------------------- |
| lint                  | **PASS** (contracts, persistence, services) |
| typecheck             | **PASS**                                    |
| tests                 | **PASS** (167)                              |
| coverage              | Overall ≥95% lines on services              |
| boundary              | No HTTP/UI/runner/cloud SDK in services src |
| repository regression | Persistence typecheck/lint/tests **PASS**   |

## Technical Debt

1. Real object-storage provider (S3/MinIO) still unimplemented
2. Attachment entity CRUD still `not_implemented`
3. Soft-archive vs status `archived` dual path can be tightened
4. Approval service line coverage slightly under 95%
5. No live-DB integration suite for new columns

## Recommended APZTCMS-007 scope

**Automation Result Ingestion** (per renumbered backlog):

1. Result adapters (JUnit / Vitest / Playwright **result files** — not owning runners)
2. Async ingestion workers linking AutomatedExecution
3. Optionally: first real `ObjectStorageProvider` if owner redirects delivery earlier

Do **not** start HTTP/Workbench UI, Event Bus, or certification engine without approval.

---

## Deliverable checklist

| Item                               | Status |
| ---------------------------------- | ------ |
| Contracts 0.3.0                    | ✅     |
| Persistence 0.4.0 + migration 0022 | ✅     |
| Services 0.2.0 domain engine       | ✅     |
| Architecture docs pack             | ✅     |
| Completion report                  | ✅     |
| Foundation stop before 007         | ✅     |
