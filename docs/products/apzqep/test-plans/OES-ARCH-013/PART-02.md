# APZQEP-OES-ARCH-013  
# PART 2 — Domain Boundaries, Relationships, Lifecycle & Versioning

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-013 |
| Part | **2 of 5** |
| Programme | APZQEP-ARCH-013 |

---

## 1. Domain boundaries

### 1.1 Aggregate — Test Plan

The **Test Plan** is the aggregate root.

| Concern | Architectural requirement |
| ------- | ------------------------- |
| Identity | Global platform ID; human-readable plan number within tenant |
| Title / description | Governed mutable content while Draft; constrained after approval |
| Objective | Why the plan exists |
| Scope | Plan Scope value (see §1.3) |
| Status | Plan Status (lifecycle) |
| Ownership | Owner identity (user / role reference) |
| Assignment | Assigned lead / team references (non-SoR for org structure) |
| Scheduling | Planned start / planned end (optional); target milestone reference |
| Execution readiness | Derived or explicit readiness indicators (architectural; computed in future Domain) |
| Revision | Optimistic concurrency revision |
| Version lineage | See Part 2 §4 |
| History | Append-only governed history |
| Tenant | Tenant-scoped |

### 1.2 Plan Items

A **Plan Item** is a membership record within a Test Plan.

| Concern | Architectural requirement |
| ------- | ------------------------- |
| Parent | Test Plan (aggregate ownership) |
| Target | Reference to a Test Specification (required for v1 architecture) |
| Optional future target | Reference to Test Case (future — architectural slot only) |
| Order / sequence | Ordered position within the plan |
| Item status | Item-level planning state (e.g. Included, Optional, Deferred, Removed) — distinct from Specification lifecycle |
| Notes | Item-local planning notes |

Plan Items **SHALL** reference Specifications by identity + version pin rules (see §4). They **SHALL NOT** embed Specification design content.

### 1.3 Plan Scope

**Plan Scope** classifies the planning context.

| Scope class | Meaning |
| ----------- | ------- |
| Release | Validates a product release |
| Product | Product-wide plan |
| Feature | Feature / epic scoped |
| Milestone | Programme milestone |
| Sprint | Iteration-scoped |
| Regression | Regression cycle |
| Certification | Certification / audit activity |
| Custom | Governed custom label |

Scope **SHALL** be a governed catalogue (extensible under future Owner Instruction). Scope **MAY** include optional foreign references (e.g. release id) without absorbing foreign SoR.

### 1.4 Plan Status

**Plan Status** is the lifecycle state of the aggregate (Part 2 §3). Status **SHALL NOT** be conflated with:

- Specification status  
- Verification outcome  
- Execution run status  

### 1.5 Ownership & assignment

| Role (architectural) | Responsibility |
| -------------------- | -------------- |
| Owner | Accountable for plan content and approval progression |
| Assigned Lead | Operational lead for readiness / coordination |
| Assignees | Optional executor identities for planning (not run assignment SoR) |

Org directories and HR systems remain external. Plans store identity references only.

### 1.6 Scheduling & execution readiness

| Concept | Meaning |
| ------- | ------- |
| Planned start / end | Planning window |
| Target milestone | Optional reference |
| Execution readiness | Whether the plan is eligible to enter In Execution (all mandatory items resolvable, approvals complete, etc.) |

Readiness rules **SHALL** be Domain concerns in future ENG. Architecture requires that readiness be **server-authoritative** and never client-invented.

---

## 2. Relationships

### 2.1 With frozen capabilities

| Capability | Relationship | Rule |
| ---------- | ------------ | ---- |
| Requirements | Optional plan-level or item-level references | Reference only; Requirements remain SoR |
| Traceability | Optional use of Trace Links for coverage views | Trace Links remain Traceability SoR; Plans consume projections |
| Verification | Optional linkage of plan objectives to Verification subjects | Verification Records remain Verification SoR; Plans do not issue verdicts |
| Test Specifications | **Primary:** Plan Items reference Specifications | Specifications remain design SoR; Plans organise membership |

### 2.2 With future capabilities

| Future capability | Relationship | Architectural stance |
| ----------------- | ------------ | -------------------- |
| Test Execution | Plans become inputs to execution campaigns | Execution owns runs; Plans expose readiness + item set |
| Test Runs | Runs reference Plan (+ version) | Run results never written into Plan SoR |
| Evidence | Evidence may cite Plan / Plan Item | Evidence SoR separate |
| Defects | Defects may cite Plan / Plan Item / Run | Defects SoR separate |
| Test Cases | Plan Items **MAY** later reference Cases | Slot reserved; not required for architecture Acceptance |

### 2.3 Relationship principles

1. Outbound references only — no foreign aggregate mutation.  
2. Version pins **SHOULD** be explicit for Specifications included in Approved / Ready plans.  
3. Cross-capability UI deep links **SHALL** reuse existing Workbench routes; Plans **SHALL NOT** host foreign editors.  
4. Unavailable future capabilities **SHALL** appear as governed “unavailable” integration slots in future Workbench Architecture — not invented SoR.

---

## 3. Lifecycle

### 3.1 States

```text
Draft
  → Review
  → Approved
  → Ready
  → In Execution
  → Completed
  → Archived
```

Additional terminal / exception states:

| State | Purpose |
| ----- | ------- |
| Rejected | Review rejected; return path to Draft only via explicit transition |
| Cancelled | Abandoned before completion |
| Superseded | Replaced by a newer plan version / successor plan |

### 3.2 Transition table (normative intent)

| From | To | Command (architectural name) | Notes |
| ---- | -- | ---------------------------- | ----- |
| Draft | Review | `submitForReview` | Requires owner; content validity |
| Review | Approved | `approve` | Authorised approver |
| Review | Rejected | `reject` | Reason required |
| Rejected | Draft | `returnToDraft` | Explicit; server-authoritative |
| Approved | Ready | `markReady` | Execution readiness gates |
| Ready | In Execution | `startExecution` | Hands off to Execution capability (future); plan state advances |
| In Execution | Completed | `complete` | Requires Execution closure signal (future) or authorised complete |
| Completed | Archived | `archive` | Retention / close-out |
| Draft / Review / Approved / Ready | Cancelled | `cancel` | Before In Execution (or with waiver rules in Domain) |
| Approved / Ready / Completed | Superseded | `supersede` | Via versioning / clone successor |

Exact permission binding and invariant details **SHALL** be Domain Engineering. Architecture **REQUIRES** explicit commands and server validation.

### 3.3 Lifecycle rules

1. Transitions **SHALL** be explicit commands — no silent status writes.  
2. History **SHALL** be append-only.  
3. Client **SHALL NOT** invent transitions.  
4. `availableActions` (future infrastructure) **SHALL** be the sole UI authority for permitted actions.  
5. In Execution / Completed **SHALL NOT** imply Plan owns run results.  
6. Archived plans are immutable except controlled unarchive under future Owner Instruction (default: no unarchive in v1 architecture).

See [APPENDIX-B.md](./APPENDIX-B.md) for state-machine summary.

---

## 4. Versioning

### 4.1 Version model

| Concept | Rule |
| ------- | ---- |
| Plan version | Immutable material version of plan content + item set |
| Revision | Optimistic concurrency token on the mutable aggregate head |
| Lineage | Predecessor / successor plan or version links |
| Authoritative version | Latest Approved/Ready/In Execution/Completed version per Domain rules |

### 4.2 Revision rules

- Draft / Rejected: content and items mutable under revision concurrency.  
- Review: mutation restricted (Domain defines amendment vs withdraw).  
- Approved and beyond: material changes **SHALL** create a new version or superseding plan — not silent rewrite.

### 4.3 Baseline behaviour

An Approved or Ready plan version **MAY** be treated as a **planning baseline** for a release/certification cycle. Baselines are plan versions, not Requirements baselines.

### 4.4 Clone strategy

Clone **SHALL** create a new Draft plan (new identity) copying:

- Title/objective/scope (with “Copy of …” convention allowed)  
- Plan Items (references)  
- Scheduling defaults cleared or copied per Domain policy  

Clone **SHALL NOT** copy history or approval signatures.

### 4.5 Supersede rules

Supersession **SHALL**:

- Mark prior version/plan Superseded  
- Point successor link  
- Preserve immutable prior content  
- Emit architectural event `plan.superseded` (catalogue name)

---

## 5. STOP (Part 2)

Domain / lifecycle / versioning are architectural only. No Domain code authorised.
