# APZQEP-OES-ENG-090A

# PART 2 — Domain Interfaces (Aggregate, Lifecycle, Policies, Errors)

| Item         | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Document     | APZQEP-OES-ENG-090A                                                    |
| Part         | **2 of 5**                                                             |
| Programme    | APZQEP-OES-ENG-090A                                                    |
| Status       | **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture | APZQEP-ARCH-015 Part 2 — authoritative                                 |

---

## 1. Aggregate root — `TestExecution`

`TestExecution` is the sole aggregate root and transactional consistency boundary.

### 1.1 Required properties

| Property                                 | Type kind                       | Engineering requirement                                       |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| `id`                                     | Platform ID                     | Globally unique; opaque to UI                                 |
| `executionNumber`                        | Tenant-scoped string            | Human-readable; unique per tenant                             |
| `tenantId`                               | Platform ID                     | Absolute isolation                                            |
| `projectId` / `workspaceId`              | Platform ID                     | Scope columns required                                        |
| `status`                                 | `ExecutionStatus` VO            | Canonical states only (Appendix B)                            |
| `mode`                                   | `ExecutionMode` VO              | `manual` \| `assisted_manual` \| `automated` \| `imported`    |
| `sourceRefs`                             | Value object                    | Plan id/version and/or Spec id/version; optional plan item id |
| `manifest`                               | `ExecutionManifest` entity      | Sealed no later than start                                    |
| `context`                                | `ExecutionContext` VO           | Extensible descriptors                                        |
| `assignment`                             | `ExecutionAssignment`           | Executor, optional reviewer, owner, agent identity            |
| `steps`                                  | Ordered `ExecutionStep[]`       | From sealed manifest; mutated via commands                    |
| `outcome`                                | `ExecutionOutcome` \| null      | Derived then finalised                                        |
| `observations`                           | `ExecutionObservation[]`        | Non-defect facts                                              |
| `evidenceReferences`                     | `EvidenceReference[]`           | External pointers only                                        |
| `review`                                 | `ExecutionReview` \| null       | Decision entity                                               |
| `externalSubmissions`                    | `ExternalExecutionSubmission[]` | Ingestion records                                             |
| `revision`                               | Integer                         | Optimistic concurrency                                        |
| `history`                                | Append-only entries             | Governed; never rewrite                                       |
| `supersedesId` / `supersededById`        | Optional IDs                    | Lineage                                                       |
| `createdAt` / `updatedAt` / actor stamps | Timestamps + ids                | Standard audit fields                                         |

### 1.2 Entities

#### ExecutionManifest (immutable after seal)

| Field                    | Requirement                                          |
| ------------------------ | ---------------------------------------------------- |
| Plan/spec/plan-item refs | Resolved at seal                                     |
| Resolved steps snapshot  | Instructions, expected results, order, preconditions |
| Preconditions set        | Snapshot                                             |
| `sealedAt` / `sealedBy`  | Required                                             |
| `contentHash`            | Required integrity hash                              |

After seal, mutation **SHALL** throw a Domain conflict/precondition error. Plan/spec changes after seal **SHALL NOT** rewrite the manifest (ADR-0076).

#### ExecutionStep

| Field                                 | Requirement                             |
| ------------------------------------- | --------------------------------------- |
| `order`                               | Integer; unordered flag **MAY** exist   |
| `instruction` / `expectedResult`      | Snapshot from manifest                  |
| `actualResult`                        | Recorded by executor/agent              |
| `outcome`                             | Step taxonomy (Part 2 §4)               |
| Evidence refs                         | Zero or more                            |
| Comments / skip / N/A / block reasons | Governed structures                     |
| `attemptCount`                        | ≥ 1 when started                        |
| Timestamps                            | Started / completed optional until done |

#### ExecutionObservation

Non-defect factual record: id, text/structured body, actor, timestamp, optional severity hint. **SHALL NOT** implement defect lifecycle (ADR-0081).

#### ExecutionReview

Reviewer id, decision (`accepted` \| `rejected`), reason (mandatory on reject), timestamps, optional outcome override with retained pre-review derived value (ADR-0082).

#### ExternalExecutionSubmission

Source system id, agent identity, idempotency key, payload hash/signature metadata, completeness flag, correlation ids, quarantine/reject reason when failed (ADR-0084).

### 1.3 Value objects

| VO                             | Values / shape                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `ExecutionStatus`              | Canonical lifecycle states only                                                                                       |
| `ExecutionMode`                | `manual` \| `assisted_manual` \| `automated` \| `imported`                                                            |
| `ExecutionOutcome` (step)      | `passed` \| `failed` \| `blocked` \| `skipped` \| `not_applicable` \| `inconclusive` \| `not_executed` \| `cancelled` |
| `ExecutionOutcome` (execution) | Derived taxonomy consistent with ARCH-015; finalised on accept/fast-path                                              |
| `ExecutionContext`             | Extensible key/value descriptors (release, build, env, platform, OS, browser, dataset, config, flags)                 |
| `ExecutionAssignment`          | Owner, executor, reviewer, automated agent identity                                                                   |
| `EvidenceReference`            | Evidence id/URI + integrity metadata; no blob                                                                         |
| `SourceVersionRef`             | Capability + id + version label/number                                                                                |

---

## 2. Domain commands (normative catalogue)

| Command                | From → To / effect                          | Guards (Domain summary)                          |
| ---------------------- | ------------------------------------------- | ------------------------------------------------ |
| `createExecution`      | → `draft`                                   | Authorised create; valid source refs             |
| `prepareExecution`     | `draft` → `ready`                           | Sources resolvable; seal manifest + hash         |
| `assignExecutor`       | `ready` → `assigned` (or update assignment) | Valid executor/agent                             |
| `startExecution`       | `assigned` → `in_progress`                  | Manifest sealed; assignee/agent authorised       |
| `recordStepResult`     | mutate step while `in_progress`             | Step exists; outcome allowed; result rules       |
| `associateEvidence`    | add EvidenceReference                       | Execution mutable; evidence ref valid            |
| `recordObservation`    | add Observation                             | Execution not terminal-forbidden                 |
| `pauseExecution`       | `in_progress` → `paused`                    | Authorised controller/executor                   |
| `blockExecution`       | `in_progress` → `blocked`                   | Reason required                                  |
| `resumeExecution`      | `paused`/`blocked` → `in_progress`          | Authorised                                       |
| `completeExecution`    | `in_progress` → `completed`                 | Steps accounted per Domain rules; derive outcome |
| `submitForReview`      | `completed` → `submitted_for_review`        | Review required by policy                        |
| `acceptExecution`      | review/fast-path → `accepted`               | Reviewer or fast-path policy                     |
| `rejectExecution`      | `submitted_for_review` → `rejected`         | Reason required                                  |
| `cancelExecution`      | → `cancelled`                               | Not accepted/superseded                          |
| `supersedeExecution`   | → `superseded`                              | Successor execution exists                       |
| `ingestExternalResult` | create/update via trust rules               | Idempotency; agent identity; not mutate finals   |

Commands **SHALL** be explicit. Silent status field writes **SHALL NOT** exist.

---

## 3. Lifecycle (engineering)

Canonical states and transitions **SHALL** match ARCH-015 Part 2 §3 and Appendix B of this OES.

### 3.1 Engineering rules

1. Transitions **SHALL** occur only via Domain commands.
2. History **SHALL** append an entry for every material command.
3. After `accepted`, `cancelled`, or `superseded`, content mutations **SHALL** be forbidden except append-only history / lineage fields.
4. Fast-path `completed → accepted` **SHALL** exist only when Domain policy permits and Application exposes it via `availableActions`.
5. `rejected` **MAY** lead to supersession / new execution — never silent rewrite of accepted truth (ADR-0085).

### 3.2 Outcome derivation

1. Domain **SHALL** derive execution-level outcome from step outcomes using deterministic rules.
2. Review **MAY** override only via audited `ExecutionReview`, retaining pre-review derived value.
3. Partial / mixed outcomes **SHALL** be representable (`not_executed` remaining steps allowed).

---

## 4. Domain invariants (normative)

I-01 … I-12 from ARCH-015 Part 2 §2 are **binding**. Engineering restatement:

1. No `in_progress` without sealed manifest + authorised source refs.
2. Sealed versions never silently change after start.
3. Completed/accepted not altered except correction policy / supersession.
4. `passed` requires actual result when manifest demands one.
5. Evidence association permission-checked (Application enforces; Domain rejects invalid association commands).
6. `cancelled` rejects ordinary completion.
7. `availableActions` computed outside Domain presentation — Domain exposes state; Application computes actions (ADR-0083).
8. Imported results identify source system + agent.
9. Review only by authorised reviewers; independence policy optional.
10. Finalised records preserve historical truth.
11. Absolute tenant isolation.
12. No absorption of Evidence / Defect / Test Runs SoR.

Additional engineering invariants:

| ID   | Invariant                                                                 |
| ---- | ------------------------------------------------------------------------- |
| I-13 | Optimistic concurrency: command with stale `revision` **SHALL** fail      |
| I-14 | Idempotency key for ingestion **SHALL** be unique per tenant+source       |
| I-15 | Manifest `contentHash` **SHALL** be verified on rehydrate when configured |
| I-16 | Supersession **SHALL** set bidirectional lineage                          |

---

## 5. Domain policies (justified)

| Policy                  | Behaviour                                                   |
| ----------------------- | ----------------------------------------------------------- |
| ManifestSealPolicy      | When sources are resolvable; what must be snapshotted       |
| AssignmentPolicy        | Self-claim vs assigner-only; reassignment while in progress |
| CompletionPolicy        | Which step outcomes permit `completeExecution`              |
| ReviewPolicy            | Review required vs fast-path accept; reviewer ≠ executor    |
| CancellationPolicy      | Allowed source states; reason requirements                  |
| SupersessionPolicy      | Eligible statuses; successor linkage                        |
| IngestionPolicy         | Create vs correlate; completeness; quarantine               |
| OutcomeDerivationPolicy | Weights / precedence for mixed step outcomes                |

Policies **SHALL** be Domain-owned pure functions / services. Workbench **SHALL NOT** encode them.

---

## 6. Justified Domain services

| Service                    | Justification                                              |
| -------------------------- | ---------------------------------------------------------- |
| `ManifestSealer`           | Resolves snapshots + hash; pure given resolved source DTOs |
| `OutcomeDeriver`           | Deterministic derivation                                   |
| `ExecutionHistoryRecorder` | Append-only entry factory                                  |
| `IngestionCorrelator`      | Pure correlation decisions given policy inputs             |

Infrastructure adapters supply resolved source DTOs; Domain services remain pure.

---

## 7. Domain error model

| Error category        | When                                                         |
| --------------------- | ------------------------------------------------------------ |
| `validation`          | Malformed command payload                                    |
| `precondition_failed` | Invalid transition / missing seal / incomplete steps         |
| `conflict`            | Stale revision / duplicate idempotency                       |
| `not_found`           | Unknown execution/step (Domain may signal; Application maps) |
| `invariant_violation` | Internal invariant breach (bug — must not reach users raw)   |

Domain errors **SHALL** be typed and descriptive. Infrastructure **SHALL** map them to API error categories without leaking internals.

---

## 8. Domain events (descriptive — raised, not published)

Domain **SHALL** raise descriptive past-tense events (catalogue in Appendix D). Publishing is Application/Infrastructure responsibility via outbox.

Naming family: `test_execution.*` (e.g. `test_execution.created`, `test_execution.prepared`, `test_execution.started`, `test_execution.step_result_recorded`, `test_execution.completed`, `test_execution.accepted`, `test_execution.external_result_received`).

---

## 9. AI boundary (Domain)

Domain **SHALL** remain deterministic. AI **SHALL NOT** execute Domain commands, invent outcomes, or mutate state. Advisory AI (future) may suggest text that a human applies via ordinary commands (ADR-0086).

---

## STOP

```text
PART-02 COMPLETE
DOMAIN INTERFACES FIXED
PURE DOMAIN ONLY
```
