# APZQEP-OES-ENG-060B

# PART 5 — Audit, Events, Errors, Observability, AI Boundary & Acceptance

| Item     | Value                                       |
| -------- | ------------------------------------------- |
| Document | **APZQEP-OES-ENG-060B**                     |
| Part     | **5 of 5**                                  |
| Status   | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Audit architecture

### 1.1 Purpose

Provide an immutable, tenant-scoped record of who did what, when, with correlation to requests and Domain events — without inventing a module-local audit product.

### 1.2 Required fields

| Field                  | Requirement                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| Who                    | `actorId` (+ display snapshot optional)                            |
| What                   | Action name (command / REST action)                                |
| When                   | Timestamp (UTC)                                                    |
| Before / after         | Material field diffs or status transition summary where applicable |
| Correlation id         | From request context                                               |
| Causation / event link | Domain event id/type when emitted                                  |
| Tenant                 | `tenantId`                                                         |
| Resource               | `planId` (+ itemId if item-scoped)                                 |

### 1.3 Mandatory audited actions

Approve · Reject · Submit for review · Mark ready · Start execution · Complete · Archive · Cancel · Supersede · Clone (create path) · Ownership transfer.

Content edits **SHOULD** be audited at summary level (not full document dumps).

### 1.4 Integration

Use Platform Audit / appender hook pattern established by Test Specifications Infrastructure. Plans **MUST NOT** create a parallel audit subsystem.

---

## 2. Event publication (Infrastructure)

### 2.1 Catalogue (normative — Domain CERT catalogue)

Infrastructure **SHALL** publish Domain events raised by `@apzhub/qep-test-plans` without renaming:

| Event type                  |
| --------------------------- |
| `qep.plan.created`          |
| `qep.plan.updated`          |
| `qep.plan.review.requested` |
| `qep.plan.approved`         |
| `qep.plan.rejected`         |
| `qep.plan.ready`            |
| `qep.plan.started`          |
| `qep.plan.completed`        |
| `qep.plan.archived`         |
| `qep.plan.cancelled`        |
| `qep.plan.superseded`       |
| `qep.plan.item.added`       |
| `qep.plan.item.updated`     |
| `qep.plan.item.removed`     |

ARCH-013 aliases (`submitted`, `readied`, `cloned`) are **not** normative wire names. If Workbench copy needs synonyms, map in presentation only. An ADR is required to change wire names.

### 2.2 Delivery expectations

| Concern       | Rule                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publisher     | Platform Event Bus via Application/Infrastructure after successful persist                                                                                    |
| Envelope      | Standard platform envelope — correlationId, causationId, tenantId, occurredAt                                                                                 |
| At-least-once | Assumed; subscribers **MUST** be idempotent                                                                                                                   |
| Ordering      | Per-aggregate ordering **SHOULD** be preserved where the bus allows; subscribers **MUST NOT** require global total order                                      |
| Failure       | Publish failure **MUST NOT** corrupt SoR; use transactional outbox **or** reliable after-commit retry with DLQ (ENG chooses; OES requires reliability design) |
| Domain purity | Domain only raises uncommitted events; Infra publishes                                                                                                        |

### 2.3 Subscribers (expected)

Search indexer · Audit/activity · future Test Execution / Suites consumers. No module-to-module direct calls.

---

## 3. Error mapping

Map Domain exceptions to application error codes/categories. **Do not** define HTTP status codes in this OES (OpenAPI/ENG binds transport).

| Domain exception              | Application category / code concept |
| ----------------------------- | ----------------------------------- |
| `PlanValidationError`         | `VALIDATION_FAILED`                 |
| `InvalidPlanStateError`       | `INVALID_STATE`                     |
| `PlanInvariantViolationError` | `INVARIANT_VIOLATION`               |
| `PlanReadinessError`          | `READINESS_FAILED` (+ reason codes) |
| `PlanConcurrencyError`        | `REVISION_CONFLICT`                 |
| `PlanLineageError`            | `LINEAGE_VIOLATION`                 |
| Not found (repo)              | `NOT_FOUND`                         |
| Number conflict (infra)       | `CONFLICT` / `NUMBER_CONFLICT`      |
| Spec missing (infra prelude)  | `REFERENCE_NOT_FOUND`               |
| Permission denied             | `FORBIDDEN` (Platform Authz)        |

Errors **MUST** include `correlationId` and stable `code`. Raw PostgreSQL / driver errors **MUST NOT** reach clients.

---

## 4. Observability

| Pillar          | Requirement                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Logging         | Structured logs: tenant, actor, planId, command, outcome, correlationId — no secrets             |
| Metrics         | Counters/histograms: command counts by type, transition latency, conflict rate, publish failures |
| Tracing         | Propagate trace/correlation across REST → Application → DB → Event publish                       |
| Health          | Persistence connectivity + optional outbox lag; surface on platform health hierarchy             |
| Correlation IDs | Mandatory on every request path (Document 010 / 014)                                             |

Observation hooks **SHOULD** mirror Specs (`onObservation` name, durationMs, outcome).

---

## 5. AI boundary

| Allowed (future programmes)                         | Forbidden                                                    |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Read DTOs / search projections for analytics        | Bypassing Domain commands                                    |
| Recommendations that propose commands               | Writing status fields directly                               |
| Planning assistance via Application APIs            | Circumventing permissions or validation                      |
| Summarisation of plan content for authorised actors | Mutating Specs / Verification / Requirements via Plans Infra |

AI **SHALL** invoke the same Application commands as humans. AI **SHALL NOT** embed business rules in Infrastructure.

MCP exposure, if any, is a **future** Owner programme.

---

## 6. Testing expectations (for ENG-060B — informational)

When Infrastructure is implemented, ENG-060B **SHALL** include:

| Suite                       | Focus                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Repository contract tests   | Postgres + InMemory parity, concurrency                                                 |
| Application handler tests   | Permission → Domain → persist → events (mocked bus)                                     |
| Architecture boundary tests | Domain package has no infra imports; infra does not reimplement Domain rules            |
| REST contract tests         | Envelope, authz, expectedRevision                                                       |
| Coverage objectives         | Align with OES quality objectives; behavioural completeness precedent applies under ECR |

Numeric targets for ENG-060B **SHOULD** follow portfolio norms (≥95% lines/functions, ≥90% branches) with ECR-justified deviations allowed per established practice.

---

## 7. Acceptance criteria (this OES)

The specification **SHALL** be Accepted only if it:

| ID    | Criterion                                                                       |
| ----- | ------------------------------------------------------------------------------- |
| AC-01 | Conforms to Document 000                                                        |
| AC-02 | Conforms to OES-000                                                             |
| AC-03 | Conforms to OES-001                                                             |
| AC-04 | Reviewable under OES-002                                                        |
| AC-05 | Consumes certified Domain `@apzhub/qep-test-plans` **0.1.0** as immutable       |
| AC-06 | Defines repository architecture                                                 |
| AC-07 | Defines persistence architecture (logical; no SQL)                              |
| AC-08 | Defines command architecture                                                    |
| AC-09 | Defines query architecture                                                      |
| AC-10 | Defines REST resource catalogue                                                 |
| AC-11 | Defines search architecture                                                     |
| AC-12 | Defines permission architecture                                                 |
| AC-13 | Defines audit architecture                                                      |
| AC-14 | Defines observability architecture                                              |
| AC-15 | Defines infrastructure event publication                                        |
| AC-16 | Contains no business rules                                                      |
| AC-17 | Contains no production code                                                     |
| AC-18 | Establishes reusable orchestration infra patterns without shared business logic |
| AC-19 | Explicitly excludes Workbench / AI / MCP implementation                         |
| AC-20 | COMPLETE.md assembled; Owner Summary + Completion Report present                |

---

## 8. STOP (programme)

```text
Programme:
APZQEP-OES-ENG-060B

Status:

IMPLEMENTED

AWAITING OWNER ACCEPTANCE
```

Do **not** begin Infrastructure implementation (**ENG-060B**) until Owner Acceptance of this OES and a separate Owner Programme Instruction.
