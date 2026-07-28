# APZQEP-OES-ENG-060A

# PART 4 — Policies, Domain Services, Business Rules & Error Model

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-060A |
| Part     | **4 of 5**          |

---

## 1. Policies

Policies are pure functions / domain services invoked by aggregate commands.

### 1.1 Approval policy

| ID    | Rule                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP-01 | `approvePlan` / `rejectPlan` only from `review`                                                                                                                                 |
| AP-02 | Approver **SHALL NOT** be the same actor as `ownerId` **unless** tenant policy flag `allowSelfApproval` is true (default **false** — flag is Application-injected policy input) |
| AP-03 | Reject **requires** non-empty comment (min 3 chars trimmed)                                                                                                                     |
| AP-04 | Approve **MAY** include comment                                                                                                                                                 |
| AP-05 | Multiple reject/approve cycles allowed via returnToDraft → resubmit; each produces new `TestPlanApproval`                                                                       |

### 1.2 Scheduling policy

| ID    | Rule                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------- |
| SP-01 | If both dates set, `plannedEnd >= plannedStart`                                                     |
| SP-02 | Schedule editable in `draft`, `rejected`, `approved`, `ready`                                       |
| SP-03 | Schedule **frozen** in `in_execution`, `completed`, `archived`, `cancelled`, `superseded`, `review` |
| SP-04 | `markReady` does **not** require dates (optional planning)                                          |
| SP-05 | Milestone ref is opaque; no calendar SoR                                                            |

### 1.3 Assignment policy

| ID    | Rule                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------- |
| AS-01 | `ownerId` always required                                                                          |
| AS-02 | `leadId` optional; if set, non-empty                                                               |
| AS-03 | Assignees deduplicated; owner/lead **MAY** also appear in assignees                                |
| AS-04 | Assignment editable in same statuses as content for `draft`/`rejected`; also in `approved`/`ready` |
| AS-05 | Assignment frozen in `review`, `in_execution`, `completed`, `archived`, `cancelled`, `superseded`  |

### 1.4 Readiness policy

`evaluateExecutionReadiness(plan) → ExecutionReadiness`

| Code                       | Condition for failure                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NOT_APPROVED`             | status ∉ {`approved`,`ready`} when evaluating for markReady/start — for `markReady`, status must be `approved` |
| `NO_INCLUDED_ITEMS`        | zero `included` items                                                                                          |
| `MISSING_VERSION_PIN`      | any `included` item lacks `specificationVersionPin`                                                            |
| `HAS_INVALID_CUSTOM_SCOPE` | `planType === custom` and label empty                                                                          |
| `OBJECTIVE_MISSING`        | objective empty                                                                                                |
| `TITLE_MISSING`            | title empty                                                                                                    |

`markReady` **SHALL** require `ready === true`.  
`startExecution` **SHALL** re-evaluate and require `ready === true`.

### 1.5 Archival policy

| ID    | Rule                                                    |
| ----- | ------------------------------------------------------- |
| AR-01 | Only `completed` → `archived`                           |
| AR-02 | Archived plan immutable (all commands fail except read) |
| AR-03 | No unarchive in v1                                      |

---

## 2. Domain services

Use domain services only where behaviour spans multiple entities or is awkward on the root alone. Prefer aggregate methods.

| Service                                     | Justification                              | Behaviour                                    |
| ------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| `PlanReadinessService.evaluate`             | Cross-cuts items + content                 | Implements readiness policy                  |
| `PlanLineageService.assertSupersedeAllowed` | Validates lineage constraints              | Ensures no double-supersede; successor empty |
| `PlanCloneService.buildDraftFrom`           | Constructs new aggregate state from source | Pure; does not persist                       |
| `PlanMetricsCalculator.recompute`           | Derives `PlanMetrics`                      | Pure                                         |

**Not domain services:** permission checks, Spec existence lookups, event bus publish, number allocation against DB uniqueness (Application may call Domain factory with preallocated number).

### 2.1 Number allocation

Domain `createTestPlan` **SHALL** accept `number` as input (allocated by Application). Domain **SHALL** validate non-empty and format: `^TP-[A-Z0-9]+-\d+$` **OR** simpler v1: non-empty trimmed max 64 — **normative v1:** non-empty, max 64, charset `[A-Za-z0-9._-]+`.

---

## 3. Business rules catalogue

### 3.1 Mandatory fields

| ID     | Rule                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| BR-M01 | `id`, `tenantId`, `number`, `title`, `ownerId`, `scope`, `status`, `priority`, `planType`, `revision` always present |
| BR-M02 | `objective` mandatory before `submitForReview`                                                                       |
| BR-M03 | ≥1 `included` item before `submitForReview`                                                                          |

### 3.2 Uniqueness

| ID     | Rule                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| BR-U01 | `number` unique per tenant — enforced at Application/Infrastructure; Domain treats as given |
| BR-U02 | Item `id` unique within plan                                                                |
| BR-U03 | No duplicate active Spec+pin pairs                                                          |

### 3.3 Ownership constraints

| ID     | Rule                                              |
| ------ | ------------------------------------------------- |
| BR-O01 | `ownerId` non-empty always                        |
| BR-O02 | `transferOwnership` only in `draft` or `rejected` |
| BR-O03 | Self-approval default denied (AP-02)              |

### 3.4 Scheduling constraints

See SP-01…SP-05.

### 3.5 Lifecycle rules

See LI-01…LI-07 and transition matrix.

### 3.6 Approval rules

See AP-01…AP-05.

### 3.7 Reference integrity

| ID     | Rule                                      |
| ------ | ----------------------------------------- |
| BR-R01 | All foreign ids non-empty opaque strings  |
| BR-R02 | Domain does not resolve foreign existence |
| BR-R03 | `testCaseId` on items rejected in v1      |

### 3.8 Immutability rules

| ID     | Rule                                                           |
| ------ | -------------------------------------------------------------- |
| BR-I01 | Sealed revisions immutable                                     |
| BR-I02 | Terminal states reject all mutating commands                   |
| BR-I03 | History append-only                                            |
| BR-I04 | `id`, `tenantId`, `number`, `createdAt`, `createdBy` immutable |

### 3.9 Submit preconditions (BR-L01…L04)

| ID     | Rule                                 |
| ------ | ------------------------------------ |
| BR-L01 | status is `draft`                    |
| BR-L02 | title & objective non-empty          |
| BR-L03 | ≥1 included item                     |
| BR-L04 | scope valid (custom label if custom) |

### 3.10 Approve precondition (BR-L05)

| ID     | Rule                                     |
| ------ | ---------------------------------------- |
| BR-L05 | status is `review`; approval policy PASS |

---

## 4. Error model (Domain exceptions only)

No HTTP / REST mapping in this OES.

| Exception (conceptual name)   | When                                                              |
| ----------------------------- | ----------------------------------------------------------------- |
| `PlanDomainError`             | Base                                                              |
| `InvalidPlanStateError`       | Command not allowed in current status                             |
| `PlanInvariantViolationError` | BR / LI violation                                                 |
| `PlanValidationError`         | Field validation (empty title, bad dates, …)                      |
| `PlanReadinessError`          | markReady/start when readiness fails (includes reason codes)      |
| `PlanConcurrencyError`        | `expectedRevision` mismatch (if Domain accepts expected revision) |
| `PlanLineageError`            | Illegal supersede/clone lineage                                   |

Each error **SHALL** carry: `code` (stable string), `message`, optional `details`.

**Concurrency:** Domain commands **SHOULD** accept `expectedRevision` and throw `PlanConcurrencyError` when mismatched before mutation.

---

## 5. History record shape

| Field                     | Required                 |
| ------------------------- | ------------------------ |
| `sequence`                | Yes — monotonic per plan |
| `at`                      | Yes                      |
| `actorId`                 | Yes                      |
| `action`                  | Yes — command name       |
| `fromStatus` / `toStatus` | When status changes      |
| `summary`                 | Yes                      |
| `correlationId`           | Optional                 |

---

## 6. STOP (Part 4)

Policies and rules are testable without infrastructure.
