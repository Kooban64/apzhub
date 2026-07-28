# APZQEP-OES-ENG-090A

# PART 3 — Application Services, Infrastructure, Persistence & Events

| Item         | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-090A                                                    |
| Part         | **3 of 5**                                                             |
| Programme    | APZQEP-OES-ENG-090A                                                    |
| Status       | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture | APZQEP-ARCH-015 Part 4 — authoritative                                 |

---

## 1. Application layer responsibilities

Application **SHALL**:

1. Authenticate via platform auth (Better Auth session / service identity).
2. Authorise via PermissionService (`qep.execution.*` — Part 4).
3. Validate command/query input (Zod or equivalent at boundary).
4. Load aggregate via repository port.
5. Invoke Domain behaviour.
6. Persist within a transaction.
7. Write centralised audit.
8. Publish events via transactional outbox.
9. Return DTOs including `availableActions`.
10. Call frozen capability contracts only through published Platform Service / package interfaces — never bypass adapters.

Transaction boundary: Domain mutation + outbox + audit **SHOULD** share one unit of work.

---

## 2. Application services (use-cases)

### 2.1 Command services

One application service method per Domain command (Part 2 §2), plus:

| Service                    | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `ExecutionCommandService`  | Orchestrates all mutating commands                |
| `ExternalIngestionService` | Trust-boundary ingestion (ADR-0084)               |
| `AvailableActionsService`  | Sole computer of UI action descriptors (ADR-0083) |

### 2.2 Query services

| Query                      | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `getExecution`             | Single execution DTO + actions                          |
| `getManifest`              | Sealed manifest view                                    |
| `listExecutions`           | Filtered, permission-scoped list                        |
| `listAssigned`             | Assignee queue                                          |
| `listReviewQueue`          | Reviewer queue                                          |
| `getHistory`               | Append-only history                                     |
| `getAvailableActions`      | Actions-only (if not embedded)                          |
| `listEvidenceReferences`   | Evidence refs                                           |
| `listObservations`         | Observations                                            |
| `getPlanExecutionProgress` | Aggregate facts for a plan version — Plan SoR unchanged |

### 2.3 `availableActions` computation (normative)

Inputs **SHALL** be:

1. Current lifecycle state
2. Actor permissions
3. Assignment relationship (executor / reviewer / owner / agent)
4. Policy flags (review required, fast-path, independence)
5. Concurrency / revision validity

Each action descriptor **SHALL** include at minimum:

| Field                  | Type                      |
| ---------------------- | ------------------------- |
| `action`               | Stable command key        |
| `label`                | Display label or i18n key |
| `requiresConfirmation` | boolean                   |
| `reasonRequired`       | boolean                   |
| `dangerous`            | boolean (optional)        |

Workbench **SHALL** treat this list as sole authority.

---

## 3. Infrastructure contracts (ports)

| Port                      | Direction | Responsibility                                                 |
| ------------------------- | --------- | -------------------------------------------------------------- |
| `TestExecutionRepository` | Outbound  | Load/save aggregate; optimistic concurrency                    |
| `ExecutionHistoryStore`   | Outbound  | Append-only history persistence                                |
| `SourceResolutionPort`    | Outbound  | Resolve Plan/Spec versions for seal (frozen packages/services) |
| `PermissionPort`          | Outbound  | PermissionService checks                                       |
| `AuditPort`               | Outbound  | Central audit write                                            |
| `EventOutboxPort`         | Outbound  | Enqueue Domain events                                          |
| `SearchPublicationPort`   | Outbound  | Project discoverable fields                                    |
| `EvidenceAccessPort`      | Outbound  | Validate evidence reference accessibility                      |
| `ClockPort` / `IdPort`    | Outbound  | Deterministic testing seams                                    |

Infrastructure **SHALL NOT** invent lifecycle transitions or outcome rules.

---

## 4. Persistence model

### 4.1 Logical tables (singular names; platform conventions)

| Table (logical)                      | Purpose                                                          |
| ------------------------------------ | ---------------------------------------------------------------- |
| `test_execution`                     | Aggregate root row + revision + status + mode + outcome + scopes |
| `test_execution_manifest`            | Immutable sealed manifest payload + hash                         |
| `test_execution_step`                | Steps + outcomes + attempts                                      |
| `test_execution_assignment`          | Current assignment (or columns on root — implementation choice)  |
| `test_execution_observation`         | Observations                                                     |
| `test_execution_evidence_reference`  | Evidence refs                                                    |
| `test_execution_review`              | Review decisions                                                 |
| `test_execution_external_submission` | Ingestion + idempotency key                                      |
| `test_execution_history`             | Append-only history                                              |
| Outbox table (platform)              | Event publication                                                |

Exact DDL **SHALL** be produced only under authorised Engineering. This OES locks the logical model and integrity controls.

### 4.2 Integrity controls

- Tenant + project/workspace scoping columns on all tenant data
- Unique `(tenant_id, execution_number)`
- Unique ingestion idempotency `(tenant_id, source_system, idempotency_key)`
- Optimistic concurrency on `revision`
- Indexes: assignee, status, plan_ref, spec_ref, review queue, updated_at
- Manifest immutability enforced at Application + DB constraint where practical
- No authoritative duplication of Plan/Spec bodies — snapshots live only in sealed manifest

### 4.3 What is not persisted here

- Evidence blobs (Evidence Management future)
- Defect records (Defect Management future)
- Test Run orchestration aggregates (future)
- Verification final statuses
- Plan/Spec editable bodies

---

## 5. Event contracts

### 5.1 Envelope

Events **SHALL** use Platform Event SDK envelope: past-tense name, schema version, correlation id, causation id, tenant, occurred-at, aggregate id/type, payload.

Future Engineering **SHALL** register `event.yaml` manifests before code (Document 029). This OES does not create those files.

### 5.2 Delivery

- Transactional outbox
- At-least-once delivery
- Idempotent consumers
- Retry / backoff / DLQ with operational visibility
- **SHALL NOT** modify frozen event packages of other capabilities

### 5.3 Catalogue

See Appendix D. Material commands **SHALL** publish corresponding past-tense events.

---

## 6. Search publication

Discoverable fields (permission-filtered at query time):

- Execution number, status, outcome, mode
- Plan / specification references (ids + version labels)
- Assignee / reviewer
- Non-sensitive context descriptors
- Timestamps

**SHALL NOT** index sensitive actual-result bodies or evidence payloads by default. Eventual consistency acceptable. Reuse platform Search Publication patterns with an additive provider in future Engineering.

---

## 7. Audit contract

Mandatory audit for: create, prepare, assign, start, step result, evidence associate, observation, pause/block/resume, complete, submit, accept/reject, cancel, supersede, ingest.

Audit fields: actor/agent, action, entity, prior/resulting state, reason, source, timestamp, tenant, correlation, automated agent identity.

Audit **SHALL** be immutable and platform-centralised — modules **SHALL NOT** implement private audit stores.

---

## 8. Frozen capability integration contracts

| Capability          | Contract usage                                                                    |
| ------------------- | --------------------------------------------------------------------------------- |
| Test Plans          | Resolve plan version + plan item for seal; never write results to Plans           |
| Test Specifications | Resolve spec version for seal                                                     |
| Traceability        | Create/read relationships using frozen vocabulary; new types = separate programme |
| Verification        | Provide facts/events only; no auto-finalisation                                   |
| Requirements        | Optional display refs via plan/spec resolution; SoR unchanged                     |

Source resolution failures:

- **Prepare:** block if unresolved
- **Post-seal runtime:** use sealed manifest; degrade gracefully if live Plan/Spec read unavailable

---

## 9. Ingestion trust boundary (Application + Infrastructure)

Flow (normative):

1. Authenticate agent identity
2. Authorise `qep.execution.ingest`
3. Validate payload schema + source registration
4. Idempotency key check
5. Correlate or create execution per IngestionPolicy
6. Integrity verification (hash/signature when configured)
7. Partial submission with explicit completeness flag
8. Duplicate detection
9. Unsupported version → reject
10. Failure → quarantine/reject with operator visibility
11. Audit + `test_execution.external_result_received`

Late results after `cancelled`/`accepted` **SHALL** be rejected or quarantined — never silently mutate finals (ADR-0084).

---

## STOP

```text
PART-03 COMPLETE
APPLICATION + INFRASTRUCTURE CONTRACTS FIXED
NO MIGRATIONS UNDER THIS PROGRAMME
```
