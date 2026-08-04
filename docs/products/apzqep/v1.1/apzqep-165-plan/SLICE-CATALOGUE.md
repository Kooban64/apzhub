# SLICE-CATALOGUE — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Permanent Slice IDs (QO-xxx)

| Legacy | Permanent ID | Name                             |
| ------ | ------------ | -------------------------------- |
| S01    | **QO-001**   | Platform Orchestration Kernel    |
| S02    | **QO-002**   | Capability Registry              |
| S03    | **QO-003**   | Trigger Engine                   |
| S04    | **QO-004**   | Quality Flow Engine              |
| S05    | **QO-005**   | Impact Correlation               |
| S06    | **QO-006**   | Policy & Test Selection          |
| S07    | **QO-007**   | Quality Gate Engine              |
| S08    | **QO-008**   | Human Approval Engine            |
| S09    | **QO-009**   | Release Recommendation Engine    |
| S10    | **QO-010**   | Event Integration                |
| S11    | **QO-011**   | Automation Integration           |
| S12    | **QO-012**   | SCM Integration                  |
| S13    | **QO-013**   | Quality Intelligence Integration |
| S14    | **QO-014**   | Evidence Integration             |
| S15    | **QO-015**   | Dashboard Integration            |
| S16    | **QO-016**   | API Platform                     |
| S17    | **QO-017**   | Workspace Experience             |
| S18    | **QO-018**   | Certification & Hardening        |

Engineering identities use **QO-xxx**. Legacy S01–S18 remain aliases from APZQEP-165-PLAN.

## Slice index

| Slice       | Name                             | Single objective                                                                               |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| **165-S01** | Platform Orchestration Kernel    | Establish `@apzhub/platform-orchestration` kernel, lifecycle, and base orchestration contracts |
| **165-S02** | Capability Registry              | Register, discover, and health-check capability contracts                                      |
| **165-S03** | Trigger Engine                   | Ingest, normalise, and route provider-neutral triggers                                         |
| **165-S04** | Quality Flow Engine              | Flow definitions, run lifecycle, state transitions, audit of transitions                       |
| **165-S05** | Impact Correlation               | Correlation context assembly via contracts (no peer SoR absorption)                            |
| **165-S06** | Policy & Test Selection          | Versioned selection/policy evaluation; Automation invoke prep                                  |
| **165-S07** | Quality Gate Engine              | Gate composition, evaluation, waiver hooks                                                     |
| **165-S08** | Human Approval Engine            | Approval workflow, SoD, escalation, audit                                                      |
| **165-S09** | Release Recommendation Engine    | Readiness, recommendation, decision recording                                                  |
| **165-S10** | Event Integration                | Orchestration event publish/consume via existing Event/Outbox                                  |
| **165-S11** | Automation Integration           | Automation orchestration contract invoke/await                                                 |
| **165-S12** | SCM Integration                  | SCM normalised events and context contracts                                                    |
| **165-S13** | Quality Intelligence Integration | QI evaluate/recommend/confidence/explainability consumption                                    |
| **165-S14** | Evidence Integration             | Evidence completeness refs and lifecycle hooks                                                 |
| **165-S15** | Dashboard Integration            | Consumer views via platform-dashboard/visualization                                            |
| **165-S16** | API Platform                     | Versioned orchestration REST APIs via Gateway                                                  |
| **165-S17** | Workspace Experience             | Quality Flow / approval operator UX (presentation only)                                        |
| **165-S18** | Certification & Hardening        | Full regression, a11y, security, perf, ops readiness prep, docs                                |

## Per-slice definition template (applies to all)

Each slice Owner Auth must lock:

| Element            | Requirement                         |
| ------------------ | ----------------------------------- |
| Objective          | One primary objective (table above) |
| In / out of scope  | Explicit; no peer SoR ownership     |
| Dependencies       | From dependency matrix              |
| Contracts touched  | Named contract IDs only             |
| Success criteria   | Testable                            |
| Evidence           | Per EVIDENCE-PLAN                   |
| Docs               | Per DOCUMENTATION-PLAN              |
| Certification gate | Per CERTIFICATION-PLAN              |
| Rollback           | Per ROLLBACK-PLAN                   |
| Architecture delta | **NONE** (frozen)                   |

## Slice detail

### 165-S01 — Platform Orchestration Kernel

- Package scaffold, versioning, SDK entry, kernel lifecycle, base types/contracts for capability invoke/await/cancel, correlation ID plumbing stubs, health self-report.
- **Out:** registry UI, real peer invokes, flows, gates, UX.

### 165-S02 — Capability Registry

- Capability registration/discovery/metadata/health registration; lifecycle DECLARED→…→RETIRED.
- **Out:** flow execution against capabilities beyond registry smoke.

### 165-S03 — Trigger Engine

- Trigger ingestion, normalisation, binding filters, routing to flow start intents; `trigger.ignored` audit.
- **Out:** full flow engine (depends on S04); raw provider payload as contract.

### 165-S04 — Quality Flow Engine

- Flow registry, run state machine, transitions, cancel/timeout hooks, durable run state requirement introduced.
- **Out:** full gate/approval/release (S07–S09); rich peer integrations.

### 165-S05 — Impact Correlation

- Correlation context builder; contract calls for SCM/change/suite maps; persist refs on run.
- **Out:** selection algorithms as product IP beyond policy hooks; owning requirements/suites SoR.

### 165-S06 — Policy & Test Selection

- Versioned selection policies; profile resolution; record selected/excluded with reasons; prepare Automation start payloads.
- **Out:** provider test runners.

### 165-S07 — Quality Gate Engine

- Gate policy composition; evaluate blocking/advisory; waiver request hooks.
- **Out:** final release decision authority.

### 165-S08 — Human Approval Engine

- Approval states, SoD, delegation, expiry, escalation; Command/Notification action paths via Platform Services.
- **Out:** autonomous production GO.

### 165-S09 — Release Recommendation Engine

- Recommendation assembly; decision record (GO/NO-GO/CONDITIONAL/DEFERRED/REJECTED/CANCELLED/SUPERSEDED); QKI projection hooks.
- **Out:** deployment execution.

### 165-S10 — Event Integration

- Event catalogue wiring, envelope, idempotent handlers, outbox composition.
- May land early stubs after S01; full catalogue completes with later slices.

### 165-S11 — Automation Integration

- Automation contract: start/cancel/await; suite refs; env targeting; concurrency policy respect.

### 165-S12 — SCM Integration

- Consume normalised SCM triggers/context; no webhook ownership transfer.

### 165-S13 — QI Integration

- Request evaluation; consume scores/recs/confidence/explainability; low-confidence policy paths.

### 165-S14 — Evidence Integration

- Completeness checks by ref; attach evidence ids to gates/decisions; no blob SoR.

### 165-S15 — Dashboard Integration

- Register consumer widgets/views; no GO ownership in UX.

### 165-S16 — API Platform

- `/api/v1/orchestration/...` groups: capabilities, flows, runs, policies, gates, approvals, decisions, health.

### 165-S17 — Workspace Experience

- Operator Quality Flow workspace, approval UX, a11y for approval-critical paths; calls APIs/services only.

### 165-S18 — Certification & Hardening

- Cross-slice regression, performance, accessibility, security, DLQ/replay drills, docs freeze for Board, 165R entry pack.
