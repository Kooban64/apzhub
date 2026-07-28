# APZQEP-OES-ARCH-015

# PART 2 — Domain Architecture, Lifecycle, Outcomes & Events

| Item      | Value               |
| --------- | ------------------- |
| Document  | APZQEP-OES-ARCH-015 |
| Part      | **2 of 5**          |
| Programme | APZQEP-ARCH-015     |

---

## 1. Domain aggregates

### 1.1 Aggregate root — TestExecution

**TestExecution** is the sole aggregate root and System of Record for a controlled performance of testing work.

| Concern          | Architectural requirement                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity         | Global platform ID; tenant-scoped human-readable execution number                                                |
| Status           | Execution lifecycle state (Part 2 §3)                                                                            |
| Source           | Immutable references to Test Plan version and/or Test Specification version + plan item identity when applicable |
| Manifest         | Associated ExecutionManifest (immutable after prepare/start)                                                     |
| Context          | ExecutionContext value                                                                                           |
| Assignment       | ExecutionAssignment (executor, optional reviewer, owner)                                                         |
| Mode             | `manual` \| `assisted_manual` \| `automated` \| `imported`                                                       |
| Steps            | Ordered collection of ExecutionStep entities                                                                     |
| Outcome          | Current and final ExecutionOutcome (nullable until completed/finalised)                                          |
| Observations     | Collection of ExecutionObservation                                                                               |
| Evidence refs    | Collection of EvidenceReference associations                                                                     |
| Review           | Optional ExecutionReview                                                                                         |
| External linkage | Optional ExternalExecutionSubmission references                                                                  |
| Revision         | Optimistic concurrency revision                                                                                  |
| History          | Append-only governed history                                                                                     |
| Tenant           | Tenant-scoped; project/workspace scoped                                                                          |

### 1.2 ExecutionManifest (entity within aggregate — immutable after seal)

Created/sealed at **prepare** or no later than **start**.

| Concern        | Requirement                                                              |
| -------------- | ------------------------------------------------------------------------ |
| Plan ref       | Plan id + plan version label/number (when plan-sourced)                  |
| Spec ref       | Specification id + specification version                                 |
| Plan item ref  | Optional plan item id                                                    |
| Resolved steps | Snapshot of step instructions, expected results, ordering, preconditions |
| Preconditions  | Resolved precondition set                                                |
| Seal time      | Timestamp + sealing actor                                                |
| Integrity      | Content hash of sealed payload                                           |

After seal, the manifest **SHALL NOT** mutate. Later plan/spec changes **SHALL NOT** rewrite sealed executions (ADR-0076).

### 1.3 ExecutionStep (entity)

| Concern                    | Requirement                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| Order                      | Integer sequence; unordered sets **MAY** share order with explicit unordered flag |
| Instruction                | Snapshot text from manifest                                                       |
| Expected result            | Snapshot text / structured expectation                                            |
| Actual result              | Recorded by executor / agent                                                      |
| Step outcome               | ExecutionOutcome (step taxonomy)                                                  |
| Evidence refs              | Zero or more EvidenceReference                                                    |
| Comments                   | Actor comments                                                                    |
| Skip / N/A / block reasons | Governed reason structures                                                        |
| Attempts                   | Attempt count for retries within same execution                                   |
| Timestamps                 | Started / completed                                                               |

### 1.4 Supporting concepts (not separate aggregate roots)

| Concept                     | Kind                  | Notes                                                                                       |
| --------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| ExecutionContext            | Value object          | Extensible descriptors (release, build, env, platform, OS, browser, dataset, config, flags) |
| ExecutionAssignment         | Value object / entity | Executor, reviewer, owner, automated agent identity                                         |
| ExecutionOutcome            | Value object          | Canonical taxonomy (Part 2 §4)                                                              |
| ExecutionObservation        | Entity                | Non-defect fact record                                                                      |
| EvidenceReference           | Value object          | External evidence pointer + integrity metadata                                              |
| ExecutionReview             | Entity                | Review decision                                                                             |
| ExternalExecutionSubmission | Entity                | Trust-boundary ingestion record                                                             |

---

## 2. Domain invariants (normative)

1. An execution **SHALL NOT** enter `in_progress` without a sealed ExecutionManifest and authorised source references.
2. Sealed source versions **SHALL NOT** silently change after start.
3. Completed / accepted executions **SHALL NOT** be altered except via governed correction policy or supersession (ADR-0085).
4. A step **SHALL NOT** be marked `passed` without an actual result where the manifest requires one.
5. Evidence references **SHALL** be associable only by actors permitted to reference that evidence.
6. `cancelled` executions **SHALL NOT** accept ordinary completion transitions.
7. `availableActions` **SHALL** derive from authoritative state + permissions + assignment — never from Workbench inference.
8. Imported automated results **SHALL** identify source system and execution agent.
9. Review decisions **SHALL** be performed only by authorised reviewers (policy **MAY** require independence from executor).
10. Finalised records **SHALL** preserve historical truth for audit and traceability.
11. Tenant isolation **SHALL** be absolute — no cross-tenant execution visibility.
12. Domain **SHALL NOT** absorb Evidence Management, Defect Management, or Test Runs orchestration responsibilities.

---

## 3. Lifecycle model

### 3.1 Canonical states

| State                  | Meaning                                                   | Terminal?                                |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `draft`                | Created; manifest may still be prepared                   | No                                       |
| `ready`                | Manifest sealed; eligible for assignment/start            | No                                       |
| `assigned`             | Executor bound; not yet started                           | No                                       |
| `in_progress`          | Active performance                                        | No                                       |
| `paused`               | Temporarily suspended by authorised actor                 | No                                       |
| `blocked`              | Cannot proceed; waiting on external condition             | No                                       |
| `completed`            | Performance finished; outcomes recorded; may await review | No                                       |
| `submitted_for_review` | Awaiting reviewer decision                                | No                                       |
| `accepted`             | Review accepted; authoritative finalisation               | **Yes** (unless superseded)              |
| `rejected`             | Review rejected; may require re-execution / supersession  | No (may supersede or re-work per policy) |
| `cancelled`            | Abandoned before authoritative acceptance                 | **Yes**                                  |
| `superseded`           | Replaced by a successor execution                         | **Yes**                                  |

States considered and **rejected** as first-class: `scheduled` (scheduling metadata lives on assignment/context; not a lifecycle state), `reviewed` (replaced by `accepted`/`rejected`).

### 3.2 Primary transitions

```text
draft → ready → assigned → in_progress ⇄ paused
                              │
                              ⇄ blocked
                              │
                              ↓
                          completed → submitted_for_review → accepted
                                         │
                                         → rejected

* → cancelled   (from non-terminal states per Domain guards)
eligible → superseded
```

Policy **MAY** allow `completed → accepted` without review when execution class and permissions permit (fast-path). Architecture requires the Domain to expose that path only via `availableActions`, never via Workbench shortcuts.

### 3.3 Transition rules (architectural)

| Transition                               | Entry conditions                                 | Actors                       | Audit    |
| ---------------------------------------- | ------------------------------------------------ | ---------------------------- | -------- |
| create → draft                           | Authorised create; source refs valid             | Creator / system             | Required |
| draft → ready                            | Manifest sealable; source versions resolvable    | Preparer                     | Required |
| ready → assigned                         | Executor identity valid                          | Assigner / self-claim policy | Required |
| assigned → in_progress                   | Assignee / agent authorised; manifest sealed     | Executor / agent             | Required |
| in_progress → paused/blocked/resume      | Authorised; reason required for block            | Executor / controller        | Required |
| in_progress → completed                  | Steps accounted for per Domain rules             | Executor / agent             | Required |
| completed → submitted_for_review         | Review required by policy                        | Executor / system            | Required |
| submitted_for_review → accepted/rejected | Reviewer authorised; decision + reason on reject | Reviewer                     | Required |
| * → cancelled                            | Guard: not accepted/superseded                   | Authorised canceller         | Required |
| eligible → superseded                    | Successor execution exists                       | Authorised actor             | Required |

Immutability: after `accepted` or `cancelled`/`superseded`, content mutations **SHALL** be forbidden except append-only history / supersession lineage.

---

## 4. Outcome model

### 4.1 Canonical step outcomes

| Outcome          | Meaning                                     |
| ---------------- | ------------------------------------------- |
| `passed`         | Step met expected result                    |
| `failed`         | Step did not meet expected result           |
| `blocked`        | Could not execute due to blocking condition |
| `skipped`        | Intentionally not performed                 |
| `not_applicable` | Step not applicable in this context         |
| `inconclusive`   | Result insufficient to decide               |
| `not_executed`   | Not reached / not attempted                 |
| `cancelled`      | Abandoned with execution cancellation       |

### 4.2 Execution-level outcome

Execution-level outcome **SHALL** be:

1. **Derived** by Domain rules from step outcomes (and policy weights), then
2. **Finalised** either automatically (fast-path) or via review acceptance.

Review **MAY** override derived outcome only through an explicit, audited review decision (ADR-0082). Overrides **SHALL** retain the pre-review derived value in history.

### 4.3 Partial and mixed executions

Partial completion **SHALL** be representable (`not_executed` remaining steps). Mixed outcomes **SHALL** be allowed. Re-execution after failure **SHALL** create a new TestExecution (or governed supersession), not silently rewrite the accepted record.

---

## 5. Assignment and responsibility

| Role                      | Responsibility                               |
| ------------------------- | -------------------------------------------- |
| Execution Owner           | Accountable for the execution record         |
| Executor                  | Performs or controls performance (human)     |
| Automated Execution Agent | Non-human performer with registered identity |
| Reviewer                  | Review / accept / reject when required       |
| Assigner                  | Binds executor (may equal owner)             |

Segregation of duties: architecture **SHOULD** allow policy requiring reviewer ≠ executor. Enforcement is Domain/application — never Workbench.

Reassignment while `in_progress` **SHALL** be an explicit command with audit. Permission loss mid-execution **SHALL** block further mutating actions until reassigned or cancelled.

---

## 6. Commands and queries (conceptual)

### Commands

`createExecution` · `prepareExecution` · `assignExecutor` · `startExecution` · `recordStepResult` · `associateEvidence` · `recordObservation` · `pauseExecution` · `blockExecution` · `resumeExecution` · `completeExecution` · `submitForReview` · `acceptExecution` · `rejectExecution` · `cancelExecution` · `supersedeExecution` · `ingestExternalResult`

### Queries

`getExecution` · `getManifest` · `listExecutions` · `listAssigned` · `listReviewQueue` · `getHistory` · `getAvailableActions` · `listEvidenceReferences` · `listObservations` · `getPlanExecutionProgress` (progress facts owned here; Plan SoR remains frozen)

---

## 7. Domain events (canonical past-tense)

| Event                                           | Trigger                 |
| ----------------------------------------------- | ----------------------- |
| `test_execution.created`                        | Create                  |
| `test_execution.prepared`                       | Manifest sealed / ready |
| `test_execution.assigned`                       | Assignment bound        |
| `test_execution.started`                        | Enter in_progress       |
| `test_execution.step_started`                   | Step begins             |
| `test_execution.step_completed`                 | Step result recorded    |
| `test_execution.evidence_associated`            | Evidence ref added      |
| `test_execution.observation_recorded`           | Observation added       |
| `test_execution.paused` / `blocked` / `resumed` | Control transitions     |
| `test_execution.completed`                      | Performance complete    |
| `test_execution.submitted_for_review`           | Review requested        |
| `test_execution.accepted` / `rejected`          | Review decision         |
| `test_execution.cancelled`                      | Cancel                  |
| `test_execution.superseded`                     | Supersession            |
| `test_execution.external_result_received`       | Ingestion accepted      |

Each event **SHALL** carry: tenant, correlation id, causation id, actor (or agent), entity id, occurred-at, and a minimal payload. Privacy classification **SHOULD** mark payloads that may contain sensitive actual-result text.

---

## 8. Domain services

Domain services **MAY** exist only for cross-aggregate pure rules, for example:

- Manifest sealing / content-hash computation rules
- Outcome derivation from step set
- Review eligibility policy evaluation (pure)

Technical orchestration (transactions, outbox, HTTP) **SHALL** remain outside Domain.

---

## STOP

```text
PART 2 COMPLETE
TESTEXECUTION AGGREGATE DEFINED
LIFECYCLE AND OUTCOMES CANONICAL
HISTORICAL INTEGRITY REQUIRED
```
