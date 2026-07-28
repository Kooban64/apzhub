# APZQEP-OES-ENG-060A  
# PART 2 — Aggregate, Entities & Value Objects

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ENG-060A |
| Part | **2 of 5** |

---

## 1. Aggregate root — `TestPlan`

`TestPlan` is the **sole aggregate root**. All mutations **SHALL** go through explicit domain commands that enforce invariants, bump concurrency revision where required, append history, and raise domain events.

### 1.1 Identity

| Field | Type (conceptual) | Rules |
| ----- | ----------------- | ----- |
| `id` | Platform UUID / global id | Immutable after create; non-empty |
| `tenantId` | Tenant id | Immutable; required |
| `number` | Human-readable plan number | Unique within tenant; assigned at create; immutable |
| `revision` | Positive integer | Optimistic concurrency; starts at `1`; increments on every successful mutation |

### 1.2 Core content (head)

| Field | Rules |
| ----- | ----- |
| `title` | Required; trimmed non-empty; max length Domain constant (recommend 200) |
| `description` | Optional; max length Domain constant (recommend 10_000) |
| `objective` | Required for `submitForReview` and beyond; trimmed non-empty |
| `scope` | `PlanScope` value object — required |
| `status` | `PlanStatus` — required |
| `priority` | `Priority` — required; default `medium` at create |
| `planType` | `PlanType` — required; aligns with scope class catalogue |
| `ownerId` | Required identity reference |
| `versionLabel` | Current material version label (e.g. `1.0`); see Part 3 |
| `predecessorPlanId` | Optional — set on clone/supersede lineage |
| `successorPlanId` | Optional — set when superseded |
| `createdAt` / `createdBy` | Set at create; immutable |
| `updatedAt` / `updatedBy` | Updated on mutation |

### 1.3 Aggregate composition

| Member | Kind | Role |
| ------ | ---- | ---- |
| `items` | Entity collection (`TestPlanItem`) | Ordered membership of Specifications |
| `schedule` | Entity / VO embed (`TestPlanSchedule`) | Planning window |
| `assignment` | Entity / VO embed (`TestPlanAssignment`) | Lead + assignees |
| `approvals` | Entity collection (`TestPlanApproval`) | Review decisions (append-oriented) |
| `revisions` | Entity collection (`TestPlanRevision`) | Material version snapshots / lineage index |
| `history` | Append-only records | Governed timeline |
| `externalReferences` | Reference collection | Optional Requirement / Verification subject refs |
| `metrics` | `PlanMetrics` VO | Derived counts (items, mandatory, optional) — recomputed on item change |
| `readiness` | Derived | `ExecutionReadiness` result of readiness policy |
| `uncommittedEvents` | Domain events | Cleared at start of each command; collected for Application layer |

### 1.4 Command catalogue (Domain)

| Command | Purpose |
| ------- | ------- |
| `createTestPlan` | Create Draft |
| `updateTestPlanContent` | Title/description/objective/scope/priority/type (mutable states only) |
| `updateTestPlanMetadata` | Non-content metadata tags (mutable states only) |
| `transferOwnership` | Change `ownerId` |
| `updateAssignment` | Lead / assignees |
| `updateSchedule` | Execution window / milestone |
| `addPlanItem` | Add Specification reference |
| `updatePlanItem` | Order, item status, notes, version pin |
| `removePlanItem` | Remove or mark Removed per policy |
| `reorderPlanItems` | Atomic reorder |
| `submitForReview` | Draft → Review |
| `approvePlan` | Review → Approved |
| `rejectPlan` | Review → Rejected |
| `returnToDraft` | Rejected → Draft |
| `markReady` | Approved → Ready |
| `startExecution` | Ready → In Execution |
| `completePlan` | In Execution → Completed |
| `archivePlan` | Completed → Archived |
| `cancelPlan` | Eligible states → Cancelled |
| `supersedePlan` | Create successor Draft + mark current Superseded |
| `cloneTestPlan` | New Draft from source (new id) |

Permission checks are **Application / Infrastructure**. Domain enforces **state machine + invariants** only; it **MAY** accept an `actorId` for history/events.

---

## 2. Entities

### 2.1 `TestPlanItem`

| Field | Rules |
| ----- | ----- |
| `id` | Unique within plan |
| `specificationId` | Required opaque reference to Test Specification |
| `specificationVersionPin` | Optional at Draft; **required** before `markReady` for items with status `included` |
| `testCaseId` | Optional; reserved for future; unused in v1 Domain — if present, Domain **SHALL** reject until Owner opens Case integration |
| `sequence` | Non-negative integer; unique order among active items |
| `itemStatus` | `included` \| `optional` \| `deferred` \| `removed` |
| `notes` | Optional |
| `requirementRefs` | Optional list of Requirement ids (reference only) |

**Invariants:**

- At least one `included` item **SHALL** exist before `submitForReview`.  
- `removed` items **SHALL NOT** count toward readiness.  
- Duplicate `(specificationId, specificationVersionPin)` among non-removed items **SHALL** be rejected.  
- Spec content **SHALL NOT** be stored on the item.

### 2.2 `TestPlanRevision`

Represents a **material version** snapshot index entry (immutable once sealed).

| Field | Rules |
| ----- | ----- |
| `versionLabel` | e.g. `1.0`, `1.1` |
| `sealedAt` / `sealedBy` | Set when version sealed (approve / ready materialisation rules) |
| `statusAtSeal` | Status when sealed |
| `itemFingerprint` | Deterministic hash/count summary of item set at seal |
| `predecessorVersionLabel` | Optional |

Full content snapshot storage strategy is Infrastructure; Domain **SHALL** treat sealed revisions as immutable.

### 2.3 `TestPlanApproval`

| Field | Rules |
| ----- | ----- |
| `id` | Unique |
| `decision` | `approved` \| `rejected` |
| `decidedBy` | Required actor id |
| `decidedAt` | Required |
| `comment` | Required when `rejected`; optional when `approved` |
| `fromStatus` / `toStatus` | Recorded |

Approvals are append-only. Latest decision is authoritative for display; lifecycle status remains on the aggregate.

### 2.4 `TestPlanAssignment`

| Field | Rules |
| ----- | ----- |
| `leadId` | Optional identity reference |
| `assigneeIds` | Zero or more identity references; duplicates removed |
| `updatedAt` / `updatedBy` | Audit |

Org structure is external. Domain stores ids only.

### 2.5 `TestPlanSchedule`

| Field | Rules |
| ----- | ----- |
| `plannedStart` | Optional instant |
| `plannedEnd` | Optional instant; if both set, `plannedEnd >= plannedStart` |
| `milestoneRef` | Optional opaque reference |
| `timezone` | Optional IANA zone for display intent (not execution SoR) |

---

## 3. Value objects

### 3.1 `PlanStatus`

Canonical Domain enum (snake_case):

`draft` · `review` · `approved` · `ready` · `in_execution` · `completed` · `archived` · `rejected` · `cancelled` · `superseded`

Mapping to ARCH-013 display labels: Draft, Review, Approved, Ready, In Execution, Completed, Archived, Rejected, Cancelled, Superseded.

### 3.2 `PlanType` / scope class

Aligned with ARCH-013 Plan Scope catalogue:

`release` · `product` · `feature` · `milestone` · `sprint` · `regression` · `certification` · `custom`

`PlanScope` **SHALL** include:

| Field | Rules |
| ----- | ----- |
| `class` | `PlanType` |
| `label` | Required when `custom`; otherwise optional display override |
| `externalRef` | Optional opaque id (e.g. release id) |

### 3.3 `Priority`

`critical` · `high` · `medium` · `low`

### 3.4 `ExecutionWindow`

Derived or embedded view of `{ plannedStart, plannedEnd }` with validation `end >= start`.

### 3.5 `ApprovalState`

Projection of latest approval: `none` · `pending_review` · `approved` · `rejected` — **SHALL NOT** replace `PlanStatus`.

### 3.6 `VersionReference`

`{ planId, versionLabel }` used when external systems cite a sealed plan version.

### 3.7 `PlanMetrics`

| Field | Computation |
| ----- | ----------- |
| `totalItems` | Count non-removed |
| `includedCount` | `itemStatus === included` |
| `optionalCount` | `optional` |
| `deferredCount` | `deferred` |
| `pinnedIncludedCount` | included with non-empty version pin |

Recomputed after item mutations; stored or derived — Infrastructure choice; Domain **SHALL** expose recomputation function.

### 3.8 `ExecutionReadiness`

| Field | Meaning |
| ----- | ------- |
| `ready` | Boolean |
| `reasons` | List of unmet readiness codes (empty iff ready) |

See Readiness policy (Part 4).

### 3.9 Identity references

Opaque string value objects: `ActorId`, `SpecificationId`, `RequirementId`, `VerificationSubjectId`, `TenantId` — non-empty; no format invention beyond non-empty trim.

---

## 4. STOP (Part 2)

Entities and VOs are specified for pure Domain implementation. No persistence mapping authorised here.
