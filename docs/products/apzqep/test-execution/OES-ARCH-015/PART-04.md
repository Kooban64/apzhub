# APZQEP-OES-ARCH-015

# PART 4 — Infrastructure, API, Integration, Security & Ingestion

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-015 |
| Part      | **4 of 5**          |
| Programme | APZQEP-ARCH-015     |

---

## 1. Layer diagram (architectural)

```text
Workbench (presentation)
        │
        ▼
API Gateway / Platform HTTP boundary
        │
        ▼
Application (authz · orchestration · availableActions · audit · events)
        │
        ▼
Domain (TestExecution aggregate · invariants · lifecycle)
        │
        ▼
Infrastructure (persistence · outbox · search publication · integrations)
        │
        ├── Frozen capability contracts (Plans · Specs · Trace · Verif · Reqs)
        ├── Evidence reference targets (future Evidence Mgmt)
        └── External automation agents (ingestion trust boundary)
```

---

## 2. Persistence (conceptual — no migrations)

Persist:

- TestExecution records + revision
- ExecutionManifest (immutable blob/row + hash)
- ExecutionSteps + attempts
- Assignments, reviews, observations
- EvidenceReference associations
- ExternalExecutionSubmission + idempotency keys
- Append-only history / audit linkage

Integrity controls:

- Tenant + project scoping columns
- Optimistic concurrency on aggregate revision
- Unique idempotency keys for ingestion
- Indexes for assignee, status, plan/spec refs, review queue

---

## 3. Application orchestration

Application **SHALL**:

1. Authenticate via platform auth
2. Authorise via PermissionService
3. Validate command input
4. Load aggregate
5. Invoke Domain behaviour
6. Persist within a transaction
7. Write audit
8. Publish events (transactional outbox pattern — reuse platform)
9. Return DTO including `availableActions`
10. Call frozen capability contracts only through Platform Service / published interfaces — never bypass adapters

Transaction boundary: Domain mutation + outbox + audit **SHOULD** share one unit of work.

---

## 4. Public API boundary (logical resources)

Prefer APZQEP consistency with existing `/api/v1/qep/...` patterns.

| Resource (conceptual)                      | Purpose                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `/qep/executions`                          | Collection create/list                                                      |
| `/qep/executions/{id}`                     | Get / inspect                                                               |
| `/qep/executions/{id}/actions/{action}`    | Command invocation pattern (or verb routes consistent with frozen QEP APIs) |
| `/qep/executions/{id}/steps`               | Step list / record result                                                   |
| `/qep/executions/{id}/evidence-references` | Associate refs                                                              |
| `/qep/executions/{id}/observations`        | Observations                                                                |
| `/qep/executions/{id}/history`             | History                                                                     |
| `/qep/executions/{id}/available-actions`   | Explicit actions query (if not embedded)                                    |
| `/qep/executions/review-queue`             | Reviewer list                                                               |
| `/qep/executions/assigned`                 | Assignee list                                                               |
| `/qep/executions/ingestions`               | External submission intake                                                  |

Exact route shapes **SHALL** be fixed in Engineering Specification; architecture locks resource concepts and authz/audit requirements.

Error categories: validation · auth · authz · conflict · not found · precondition failed · ingestion rejected — no raw backend leakage.

---

## 5. Events and outbox

- Publish Domain events via platform Event Bus / outbox
- At-least-once delivery; consumers idempotent
- Correlation and causation IDs mandatory
- Event versioning compatible with Platform Event SDK patterns
- Failure handling: retry / DLQ operational visibility
- **SHALL NOT** modify frozen event packages; register new `event.yaml` manifests in a future ENG programme

---

## 6. Search

Discoverable fields (permission-filtered at query time):

- Execution number, status, outcome, mode
- Plan / specification references (ids + version labels)
- Assignee / reviewer
- Context descriptors (non-sensitive)
- Timestamps

**SHALL NOT** index sensitive actual-result bodies or evidence payloads by default. Eventual consistency acceptable. Reuse Search Publication patterns without modifying frozen search adapters beyond future additive providers.

---

## 7. Audit

Mandatory audit for material actions: create, prepare, assign, start, step result, evidence associate, observation, pause/block/resume, complete, submit, accept/reject, cancel, supersede, ingest.

Audit fields: actor/agent, action, entity, prior/resulting state, reason, source, timestamp, tenant, correlation, automated agent identity.

Audit **SHALL** be immutable and platform-centralised.

---

## 8. Observability

| Pillar  | Indicators                                                                             |
| ------- | -------------------------------------------------------------------------------------- |
| Metrics | Created/started/completed rates; blocked count; review queue depth; ingestion failures |
| Logs    | Structured; no secrets; correlation ids                                                |
| Traces  | Command path Gateway → Application → Domain → Persistence                              |
| Health  | Capability readiness; dependency health (DB, bus, frozen services)                     |
| Alerts  | Ingestion spike failures; outbox lag; review backlog thresholds (ops-defined later)    |

---

## 9. Security and tenancy

- Platform authentication only
- Authorisation on every command/query
- Absolute tenant isolation
- Assignment-scoped execute rights
- Reviewer permissions distinct
- Evidence access checks on association
- Service identities for automation agents
- Rate limiting / abuse controls at gateway
- Sensitive test data: classify actual results / datasets; restrict export; retention policy hooks for future ENG

---

## 10. External execution ingestion trust boundary

ExternalExecutionSubmission flow:

1. Authenticate agent identity
2. Authorise `ingest`
3. Validate payload schema + source registration
4. Idempotency key check
5. Correlate to existing or create execution per policy
6. Integrity verification (hash/signature where configured)
7. Partial submission support with explicit completeness flag
8. Duplicate detection
9. Unsupported version → reject
10. On failure → quarantine / reject with operator visibility
11. Audit + `test_execution.external_result_received`

Late-arriving results after `cancelled`/`accepted` **SHALL** be rejected or quarantined — never silently mutate finals (ADR-0084).

---

## 11. Integration with frozen capabilities

### 11.1 Requirements

Trace via Traceability relationships; do not modify Requirements. Execution **MAY** store optional requirement id references for display only when provided by plan/spec resolution — authoritative links remain Traceability.

### 11.2 Traceability

Use frozen Trace Types / relationship vocabulary. Intended chain (conceptual):

```text
Requirement → Verification → Test Specification → Test Plan → TestExecution → (result facts)
```

New relationship types, if required, **SHALL** be requested via separate Traceability change programme — not invented incompatibly here.

### 11.3 Verification

Execution outcomes provide **evidence toward** verification. Test Execution **SHALL NOT** set final Verification status unless a future additive Verification contract explicitly allows an authorised linkage. Until then, Verification remains separately decided.

### 11.4 Test Specifications

Consume fixed specification version; seal into ExecutionManifest. No Spec authoring.

### 11.5 Test Plans

Create/prepare executions from plan items and plan version. Preserve Test Plans baseline and accepted limitations. Progress returned as execution facts / events — Plan does not store execution results (ARCH-013 invariant retained).

If Plan needs new additive “execution progress” projection contracts, that is a **separate** Plan change programme.

---

## STOP

```text
PART 4 COMPLETE
INFRASTRUCTURE CONCEPTUAL ONLY
NO MIGRATIONS · NO API IMPLEMENTATION
FROZEN INTEGRATIONS BY REFERENCE
```
