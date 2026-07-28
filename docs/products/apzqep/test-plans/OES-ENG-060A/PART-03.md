# APZQEP-OES-ENG-060A

# PART 3 — Lifecycle, Versioning & Relationships

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-060A |
| Part     | **3 of 5**          |

---

## 1. Lifecycle

### 1.1 State diagram

```text
draft → review → approved → ready → in_execution → completed → archived

review → rejected → draft
draft|review|approved|ready → cancelled
approved|ready|completed → superseded   (via supersedePlan)
```

Terminal: `cancelled` · `superseded` · `archived` (archived admits no further transitions in v1).

### 1.2 Transition matrix (normative)

| Command           | From                                   | To                                      | Preconditions (Domain)                                                     | Postconditions                                                                                                                                            |
| ----------------- | -------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submitForReview` | `draft`                                | `review`                                | BR-L01…L04                                                                 | History + `plan.review.requested`                                                                                                                         |
| `approvePlan`     | `review`                               | `approved`                              | BR-L05                                                                     | Seal revision if required; approval entity; `plan.approved`                                                                                               |
| `rejectPlan`      | `review`                               | `rejected`                              | Comment non-empty                                                          | Approval entity; `plan.rejected`                                                                                                                          |
| `returnToDraft`   | `rejected`                             | `draft`                                 | —                                                                          | `plan.updated` (or dedicated return event optional); status draft                                                                                         |
| `markReady`       | `approved`                             | `ready`                                 | Readiness policy PASS                                                      | `plan.ready`                                                                                                                                              |
| `startExecution`  | `ready`                                | `in_execution`                          | Readiness still PASS                                                       | `plan.started` — Domain does **not** create runs                                                                                                          |
| `completePlan`    | `in_execution`                         | `completed`                             | Actor authorised at Application; Domain accepts completion signal flag     | `plan.completed`                                                                                                                                          |
| `archivePlan`     | `completed`                            | `archived`                              | —                                                                          | Content immutable; `plan.archived`                                                                                                                        |
| `cancelPlan`      | `draft`\|`review`\|`approved`\|`ready` | `cancelled`                             | Not `in_execution`+ without waiver — v1: **forbidden** from `in_execution` | `plan` cancel event (catalogue: treat as `plan.updated` subtype or `plan.cancelled` — **SHALL** emit `plan` cancellation; use `qep.plan.cancelled` alias) |
| `supersedePlan`   | `approved`\|`ready`\|`completed`       | source → `superseded`; new plan `draft` | Successor created                                                          | Lineage links; `plan.superseded`                                                                                                                          |

### 1.3 Mutability by status

| Status         | Content / items editable                     | Assignment / schedule editable                 |
| -------------- | -------------------------------------------- | ---------------------------------------------- |
| `draft`        | Yes                                          | Yes                                            |
| `rejected`     | Yes                                          | Yes                                            |
| `review`       | **No** (withdraw via reject→draft or cancel) | **No**                                         |
| `approved`     | **No** (material change → supersede)         | Schedule **MAY** update per Scheduling policy  |
| `ready`        | **No**                                       | Schedule **MAY** update until `startExecution` |
| `in_execution` | **No**                                       | **No**                                         |
| `completed`    | **No**                                       | **No**                                         |
| `archived`     | **No**                                       | **No**                                         |
| `cancelled`    | **No**                                       | **No**                                         |
| `superseded`   | **No**                                       | **No**                                         |

### 1.4 Lifecycle invariants

| ID    | Invariant                                                         |
| ----- | ----------------------------------------------------------------- |
| LI-01 | Status changes **only** via listed commands                       |
| LI-02 | History append-only; never rewrite                                |
| LI-03 | `rejected` **SHALL NOT** transition to `approved`                 |
| LI-04 | `archived` / `cancelled` / `superseded` are terminal in v1        |
| LI-05 | Plan **SHALL NEVER** store execution run results                  |
| LI-06 | `in_execution` / `completed` do not imply Verification outcomes   |
| LI-07 | Client-invented transitions **SHALL** be impossible at Domain API |

See [APPENDIX-B.md](./APPENDIX-B.md).

---

## 2. Versioning

### 2.1 Concepts

| Concept              | Domain rule                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `revision`           | Concurrency token; every successful command increments by 1                                                                              |
| `versionLabel`       | Material version of sealed content+items                                                                                                 |
| Create               | Starts at `versionLabel = "0.1"` (Draft working) or `"1.0-draft"` — **normative:** start `"0.1"`; on first `approvePlan` seal as `"1.0"` |
| Subsequent supersede | Successor Draft `"0.1"`; on approve, next minor/major per policy: default next `"N+1.0"` from predecessor sealed major                   |

**Normative sealing rule:**

1. Working Draft uses `versionLabel` ending in working state (`0.1` family).
2. On `approvePlan`, Domain seals current content as next integer major `"1.0"`, `"2.0"`, … creating `TestPlanRevision`.
3. Further material change requires `supersedePlan` (new aggregate or new working version on successor).

### 2.2 Immutability guarantees

- Sealed `TestPlanRevision` entries **SHALL NOT** be mutated.
- After `approved`, head content/items **SHALL NOT** change except via supersede.
- History records **SHALL NOT** be deleted or edited.

### 2.3 Baseline behaviour

An `approved` or `ready` sealed version **MAY** be cited as a planning baseline via `VersionReference`. This is **not** a Requirements baseline.

### 2.4 Clone behaviour (`cloneTestPlan`)

| Copied                                                              | Not copied                                     |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| Title (prefix `"Copy of "` **SHALL** be applied if title unchanged) | `id`, `number`                                 |
| Description, objective, scope, priority, type                       | History                                        |
| Items (spec id, pin, status, notes, order)                          | Approvals                                      |
| Assignment (optional — default **copy lead/assignees**)             | `predecessor` unless policy sets clone lineage |
| Schedule — **SHALL** clear planned dates by default                 | Events                                         |

Result status: always `draft`. Emit `plan.created` (clone) and optionally note source in history.

### 2.5 Supersede behaviour (`supersedePlan`)

1. Preconditions: status ∈ {`approved`,`ready`,`completed`}.
2. Create new `TestPlan` Draft with copied items/content; set `predecessorPlanId`.
3. Set source `successorPlanId`; source status → `superseded`.
4. Emit `plan.superseded` on source; `plan.created` on successor.
5. Source content remains immutable.

---

## 3. Relationships (reference-only)

### 3.1 Test Specifications (primary)

| Rule    | Statement                                                    |
| ------- | ------------------------------------------------------------ |
| R-TS-01 | `TestPlanItem.specificationId` is mandatory for v1 items     |
| R-TS-02 | Domain **SHALL NOT** load or embed Specification bodies      |
| R-TS-03 | Version pin required for `included` items before `markReady` |
| R-TS-04 | Domain **SHALL NOT** change Specification lifecycle          |

### 3.2 Requirements

| Rule    | Statement                                       |
| ------- | ----------------------------------------------- |
| R-RQ-01 | Optional refs on plan or item — opaque ids only |
| R-RQ-02 | No Requirement mutation                         |

### 3.3 Traceability

| Rule    | Statement                                           |
| ------- | --------------------------------------------------- |
| R-TR-01 | Domain does not store Trace Links                   |
| R-TR-02 | Coverage analysis is Application/projection concern |

### 3.4 Verification

| Rule    | Statement                                  |
| ------- | ------------------------------------------ |
| R-VR-01 | Optional verification subject refs on plan |
| R-VR-02 | Domain issues no verification outcomes     |

### 3.5 Future Execution / Runs / Evidence / Defects

Domain **SHALL** expose readiness and identity for handoff. Domain **SHALL NOT** model run results, evidence blobs, or defect records.

---

## 4. STOP (Part 3)

Lifecycle and versioning are fully specified for pure Domain tests in a future ENG programme.
