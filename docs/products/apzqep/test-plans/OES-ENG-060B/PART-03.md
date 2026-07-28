# APZQEP-OES-ENG-060B

# PART 3 — Application Commands & Queries

| Item     | Value                                       |
| -------- | ------------------------------------------- |
| Document | **APZQEP-OES-ENG-060B**                     |
| Part     | **3 of 5**                                  |
| Status   | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Application layer role

Application handlers **SHALL**:

1. Authenticate/authorise via Platform (permission check).
2. Validate transport/DTO shape (Zod or equivalent) — **not** business invariants.
3. Load or create Domain aggregate.
4. Invoke Domain commands from `@apzhub/qep-test-plans`.
5. Persist via repository inside a transaction.
6. Append history / audit; publish Domain events; upsert search.
7. Return DTOs including `availableActions` (server-authoritative).

Application **MUST NOT** embed lifecycle rules, readiness rules, or approval policies. Those remain in Domain.

---

## 2. Standard command orchestration sequence

```text
assertPermission(operation)
validateDto(input)
openRequestContext(tenant, actor, correlationId)
beginTransaction
  loadOrCreateAggregate
  invokeDomainCommand(...)
  repository.save(aggregate, expectedRevision?)
  appendHistory(...)
commitTransaction
appendAudit(...)            # after commit (or outbox)
publishDomainEvents(...)    # after commit (or outbox)
upsertSearchProjection(...) # after commit (or outbox)
observe(success)
return PlanDto + availableActions
```

On Domain or concurrency failure: rollback, map error (Part 5), observe(failure), return typed error envelope.

---

## 3. Command catalogue

Each command **SHALL** map 1:1 to a Domain function unless noted as Infrastructure-only prelude.

| Application command | Domain call              | Permission (see Part 4) | Notes                                         |
| ------------------- | ------------------------ | ----------------------- | --------------------------------------------- |
| CreatePlan          | `createTestPlan`         | `qep.plan.create`       | Infra allocates `number` before Domain create |
| UpdatePlanContent   | `updateTestPlanContent`  | `qep.plan.update`       | Requires `expectedRevision`                   |
| UpdatePlanMetadata  | `updateTestPlanMetadata` | `qep.plan.update`       | Tags/priority/etc.                            |
| TransferOwnership   | `transferOwnership`      | `qep.plan.update`       |                                               |
| UpdateAssignment    | `updateAssignment`       | `qep.plan.assign`       |                                               |
| UpdateSchedule      | `updateSchedule`         | `qep.plan.schedule`     |                                               |
| AddPlanItem         | `addPlanItem`            | `qep.plan.update`       | Spec existence check is Infra prelude         |
| UpdatePlanItem      | `updatePlanItem`         | `qep.plan.update`       |                                               |
| RemovePlanItem      | `removePlanItem`         | `qep.plan.update`       |                                               |
| ReorderPlanItems    | `reorderPlanItems`       | `qep.plan.update`       |                                               |
| SubmitForReview     | `submitForReview`        | `qep.plan.submit`       |                                               |
| ApprovePlan         | `approvePlan`            | `qep.plan.approve`      |                                               |
| RejectPlan          | `rejectPlan`             | `qep.plan.reject`       |                                               |
| ReturnToDraft       | `returnToDraft`          | `qep.plan.update`       | Rejected → Draft only                         |
| MarkReady           | `markReady`              | `qep.plan.ready`        | Domain readiness evaluation                   |
| StartExecution      | `startExecution`         | `qep.plan.execute`      |                                               |
| CompletePlan        | `completePlan`           | `qep.plan.complete`     |                                               |
| ArchivePlan         | `archivePlan`            | `qep.plan.archive`      |                                               |
| CancelPlan          | `cancelPlan`             | `qep.plan.cancel`       |                                               |
| SupersedePlan       | `supersedePlan`          | `qep.plan.supersede`    | Creates successor in same tx                  |
| ClonePlan           | `cloneTestPlan`          | `qep.plan.clone`        | New number allocated by Infra                 |

### 3.1 Restore

| Command                        | Status                             |
| ------------------------------ | ---------------------------------- |
| RestoreFromArchive / Unarchive | **NOT AUTHORISED** (v1) — ARCH-013 |

Owner Instruction would be required to add restore later. Session/UI restore is out of scope.

---

## 4. Command contracts (normative shape)

For every mutating command, the specification defines:

| Element               | Requirement                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Input                 | Tenant + actor from context; resource ids; DTO fields; `expectedRevision` when mutating existing plan       |
| Preconditions (Infra) | Permission; tenant match; optional Spec existence for item ops; number uniqueness on create/clone/supersede |
| Domain interaction    | Exact Domain function; no alternate status writes                                                           |
| Output                | Plan DTO (or successor DTO for supersede/clone) + `availableActions` + new `revision`                       |
| Side effects          | History, audit, events, search — after successful persist                                                   |

Detailed field-level DTOs **MAY** be refined in ENG-060B OpenAPI; conceptual fields **MUST** align with Domain + ARCH-013.

### 4.1 CreatePlan — example contract

| Aspect | Spec                                                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input  | title, objective, planType/scope, priority, owner (default actor), optional schedule/assignment/items                                                                       |
| Infra  | Allocate unique `number`; build Domain create input                                                                                                                         |
| Domain | `createTestPlan`                                                                                                                                                            |
| Output | Created plan DTO · `revision = 1` · `availableActions`                                                                                                                      |
| Events | `qep.plan.created` (+ item events if items created in-band — prefer separate item commands for clarity; Create **MAY** accept initial items if Domain create supports them) |

### 4.2 Approve / Reject / Submit — example

| Aspect | Spec                                                                      |
| ------ | ------------------------------------------------------------------------- |
| Input  | `planId`, `expectedRevision`, comment (reject/approve as Domain requires) |
| Infra  | Authz only — no approval policy in Infra                                  |
| Domain | `submitForReview` / `approvePlan` / `rejectPlan`                          |
| Output | Updated plan DTO                                                          |
| Audit  | Mandatory for approve/reject/submit                                       |

### 4.3 Clone / Supersede

| Aspect    | Spec                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| Clone     | New plan number; Domain `cloneTestPlan`; lineage `cloned_from_plan_id`                      |
| Supersede | Domain `supersedePlan`; source → `superseded`; successor created; both persisted atomically |

---

## 5. Query catalogue

Queries **SHALL** be read-only and **MUST NOT** invoke Domain mutating commands. Readiness evaluation **MAY** call pure Domain helpers (`getExecutionReadiness`) on a loaded aggregate.

| Query                 | Purpose                                       | Typical filters                                  |
| --------------------- | --------------------------------------------- | ------------------------------------------------ |
| GetPlanById           | Full plan detail + items + `availableActions` | id                                               |
| ListPlans             | Paginated explorer                            | status, owner, lead, schedule, q, tags           |
| ListPlansByStatus     | Convenience                                   | status ∈ …                                       |
| ListPlansByOwner      | Convenience                                   | ownerId                                          |
| ListPlansBySchedule   | Window overlap                                | from/to                                          |
| ListActivePlans       | Non-terminal / non-archived default set       | exclude archived/cancelled/superseded by default |
| ListArchivedPlans     | Archived only                                 | status = archived                                |
| ListRecentlyUpdated   | Sorted by updatedAt                           | limit/page                                       |
| GetVersionHistory     | Revision list                                 | planId                                           |
| GetPlanHistory        | Append-only history                           | planId                                           |
| CompareVersions       | Diff metadata/snapshots                       | planId, fromRev, toRev                           |
| GetExecutionReadiness | Pure Domain helper projection                 | planId                                           |

Default list behaviour **SHOULD** exclude `archived`, `cancelled`, and `superseded` unless explicitly requested.

---

## 6. `availableActions`

Infrastructure **SHALL** compute `availableActions` for DTOs by combining:

1. Actor permissions (`qep.plan.*`)
2. Domain-legal transitions for current status (from Domain policies / command preflight — **without** inventing transitions)

Workbench **MUST NOT** invent actions (ADR-0074 class rule). If Domain forbids a transition, Infra **MUST NOT** advertise it.

---

## 7. Validation split

| Layer                   | Validates                                                                        |
| ----------------------- | -------------------------------------------------------------------------------- |
| Transport / Application | Schema, types, required fields, UUID format, page bounds                         |
| Domain                  | Invariants, lifecycle legality, readiness, duplicate pins, immutability          |
| Infrastructure          | Tenant RLS, number uniqueness, Spec existence (reference integrity), concurrency |

---

## STOP (Part 3)
