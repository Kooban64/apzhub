# APZQEP-OES-ENG-060A  
# PART 5 — Domain Events, AI Boundary, Quality & Acceptance Criteria

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ENG-060A |
| Part | **5 of 5** |

---

## 1. Domain events (descriptive catalogue)

Events are raised as uncommitted domain events on the aggregate. **No** Event Bus, outbox, or infrastructure in this programme.

### 1.1 Catalogue

| Event type | Raised by | Payload (minimum) |
| ---------- | --------- | ----------------- |
| `qep.plan.created` | create / clone / supersede successor | planId, tenantId, number, actorId |
| `qep.plan.updated` | content/metadata/assignment/schedule/item mutations | planId, revision, actorId |
| `qep.plan.review.requested` | `submitForReview` | planId, actorId |
| `qep.plan.approved` | `approvePlan` | planId, versionLabel, actorId |
| `qep.plan.rejected` | `rejectPlan` | planId, actorId, comment |
| `qep.plan.ready` | `markReady` | planId, actorId |
| `qep.plan.started` | `startExecution` | planId, actorId |
| `qep.plan.completed` | `completePlan` | planId, actorId |
| `qep.plan.archived` | `archivePlan` | planId, actorId |
| `qep.plan.cancelled` | `cancelPlan` | planId, actorId |
| `qep.plan.superseded` | `supersedePlan` (source) | planId, successorPlanId, actorId |
| `qep.plan.item.added` | `addPlanItem` | planId, itemId, specificationId |
| `qep.plan.item.updated` | `updatePlanItem` / reorder | planId, itemId |
| `qep.plan.item.removed` | `removePlanItem` | planId, itemId |

### 1.2 ARCH-013 alignment

ARCH-013 used names such as `qep.plan.submitted` / `qep.plan.readied`. This OES **normatively** uses Owner Instruction names `qep.plan.review.requested` and `qep.plan.ready`. Future Infrastructure Event SDK manifests **SHALL** use this OES catalogue. ADR required to rename.

### 1.3 Event rules

1. Past-tense / descriptive naming.  
2. Include planId + tenantId + actorId + occurredAt.  
3. Correlation id optional until Application supplies it.  
4. Clearing uncommitted events at command start.  
5. Publishing is Application/Infrastructure — out of scope.

---

## 2. AI boundary

### 2.1 Domain remains deterministic

Given the same aggregate state and command input, Domain results **SHALL** be identical. AI **SHALL NOT** execute inside Domain command handlers.

### 2.2 Future AI MAY (outside Domain)

| Assistance | Constraint |
| ---------- | ---------- |
| Suggesting plan drafts | Produces DTO suggestions for human/Application create |
| Coverage analysis | Read models only |
| Missing specification detection | Advisory |
| Duplicate plan detection | Advisory |

### 2.3 AI MUST NOT

- Call Domain commands as an authority bypassing permissions  
- Approve / reject / start / complete plans autonomously as SoR  
- Mutate frozen capabilities  
- Alter readiness evaluation non-deterministically  

---

## 3. Testability requirements (for future ENG-060A)

Future Domain implementation **SHALL** provide pure unit tests for:

1. Every lifecycle transition success path  
2. Every illegal transition → `InvalidPlanStateError`  
3. Readiness pass/fail reason codes  
4. Clone and supersede lineage  
5. Item uniqueness and pin rules  
6. Immutability after approve/archive  
7. Reject comment enforcement  
8. Schedule date ordering  
9. Concurrency revision mismatch  

No database required for these tests.

---

## 4. Traceability to ARCH-013

| ARCH-013 concern | OES section |
| ---------------- | ----------- |
| Test Plan aggregate | Part 2 §1 |
| Plan Items | Part 2 §2.1 |
| Scope / Status | Part 2 §3 |
| Ownership / Assignment / Scheduling | Part 2 §2.4–2.5; Part 4 policies |
| Execution readiness | Part 4 §1.4 |
| Lifecycle transitions | Part 3 §1 |
| Versioning / clone / supersede | Part 3 §2 |
| Relationships | Part 3 §3 |
| Events | Part 5 §1 |
| AI boundary | Part 5 §2 |
| No infrastructure | Part 1 §6 |

---

## 5. Acceptance criteria (this OES programme)

The specification **SHALL**:

1. Conform to OES-000, OES-001; be reviewable under OES-002.  
2. Conform to ARCH-013 without silent deviation.  
3. Define complete aggregate, entities, value objects.  
4. Define lifecycle invariants, policies, domain events, business rules.  
5. Define domain services only where justified.  
6. Define AI boundaries.  
7. Contain no infrastructure, implementation, or production code.

---

## 6. Deliverables

| Artefact | Path |
| -------- | ---- |
| Parts / Appendices / COMPLETE | `docs/products/apzqep/test-plans/OES-ENG-060A/` |
| Owner Summary | `OWNER-SUMMARY.md` |
| Completion Report | `ENGINEERING-SPECIFICATION-COMPLETION-REPORT.md` |

---

## 7. STOP (Part 5)

```text
APZQEP-OES-ENG-060A
ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
NEXT: APZQEP-ENG-060A (Owner Instruction)
```
