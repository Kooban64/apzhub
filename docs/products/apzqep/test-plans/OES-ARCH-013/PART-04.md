# APZQEP-OES-ARCH-013  
# PART 4 — Integration Points, REST Surface & Events

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-013 |
| Part | **4 of 5** |
| Programme | APZQEP-ARCH-013 |

---

## 1. Integration points

### 1.1 Requirements (frozen)

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| Plan references Requirement ids | Plan → Requirements | Reference only |
| Coverage panel may list Requirements via Trace | Read projection | No Requirement mutation |
| Deep link to Requirements Workbench | UI | Existing routes |

### 1.2 Traceability (frozen)

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| Consume Trace Links for coverage views | Plan → Trace | Read-only consumer |
| Create Trace Links | Not owned by Plans | Traceability SoR |

### 1.3 Verification (frozen)

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| Optional subject reference (what the plan supports verifying) | Plan → Verification subjects | Reference only |
| Verification verdicts | Never written by Plans | Verification SoR |

### 1.4 Test Specifications (frozen)

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| Plan Items reference Specifications (+ version pin) | Plan → Specs | Primary integration |
| Spec lifecycle / availableActions | Specs own | Plans **SHALL NOT** invent Spec transitions |
| Deep link to Spec Inspector | UI | Existing Test Specs routes |

### 1.5 Future Test Execution / Test Runs

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| `startExecution` advances Plan to In Execution | Plan state | Execution campaign created elsewhere |
| Runs reference Plan version | Execution → Plan | Plan does not store results |
| Completion signal | Execution → Plan | Authorised `complete` transition |

### 1.6 Future Evidence / Defects

| Interaction | Direction | Rule |
| ----------- | --------- | ---- |
| Evidence cites Plan / Item / Run | Evidence → Plan | Citation only |
| Defects cite Plan / Item / Run | Defects → Plan | Citation only |

### 1.7 Integration principles

1. **No layer bypass** — future clients call APZHUB APIs only.  
2. **No module-to-module coupling** — orchestration via Platform Services.  
3. **Unavailable future slots** — Workbench **SHALL** show governed unavailable states, not fake data.  
4. **Correlation IDs** — all cross-capability async flows carry correlation ids (Document 010 / 012).

---

## 2. REST surface (architecture only)

High-level resources. **No endpoint implementation** in this programme.

### 2.1 Resource map

| Resource | Path (architectural) | Purpose |
| -------- | -------------------- | ------- |
| Plan collection | `/api/v1/qep/plans` | List / create |
| Plan | `/api/v1/qep/plans/{planId}` | Get / update (Draft) |
| Plan actions | `/api/v1/qep/plans/{planId}/actions/{action}` | Lifecycle commands |
| Plan items | `/api/v1/qep/plans/{planId}/items` | List / add / reorder |
| Plan item | `/api/v1/qep/plans/{planId}/items/{itemId}` | Update / remove |
| Plan history | `/api/v1/qep/plans/{planId}/history` | Append-only history |
| Plan versions | `/api/v1/qep/plans/{planId}/versions` | Lineage |
| Plan compare | `/api/v1/qep/plans/{planId}/compare` | Compare two versions |
| Plan clone | `/api/v1/qep/plans/{planId}/clone` | Clone to Draft |

### 2.2 Contract principles (future ENG)

1. REST-first, versioned, validated, authn/authz, audit, envelope (Document 010).  
2. DTOs **SHALL** include server-computed `availableActions`.  
3. Backend engine details **SHALL NOT** leak.  
4. Optimistic concurrency via `expectedRevision`.  
5. Tenant isolation mandatory.

See [APPENDIX-C.md](./APPENDIX-C.md).

---

## 3. Events (architectural catalogue)

Platform Event SDK (`event.yaml`) **SHALL** be used in future ENG. Catalogue names (past tense):

| Event | When |
| ----- | ---- |
| `qep.plan.created` | Plan created |
| `qep.plan.updated` | Material Draft update |
| `qep.plan.submitted` | Submitted for review |
| `qep.plan.approved` | Approved |
| `qep.plan.rejected` | Rejected |
| `qep.plan.readied` | Marked Ready |
| `qep.plan.started` | Entered In Execution |
| `qep.plan.completed` | Completed |
| `qep.plan.archived` | Archived |
| `qep.plan.cancelled` | Cancelled |
| `qep.plan.superseded` | Superseded |
| `qep.plan.item.added` | Plan Item added |
| `qep.plan.item.removed` | Plan Item removed |
| `qep.plan.item.updated` | Plan Item updated |
| `qep.plan.cloned` | Clone created |

### 3.1 Event rules

1. Platform Services publish — modules do not notify directly.  
2. Envelope includes correlation / causation ids.  
3. Subscribers (search, audit, activity, future Execution) **SHALL** be idempotent.  
4. No AI/MCP side-effects from events without separate authorised programmes.

---

## 4. Observability & audit (architectural)

Future engineering **SHALL** provide:

- Structured logs with correlation ids  
- Health for Plan service / connector path  
- Audit for approve, start, complete, archive, supersede  
- Metrics: plan counts by status, transition latency (optional)

Administration Workspace remains the ops console (Document 014).

---

## 5. STOP (Part 4)

Integration, REST, and events are architectural contracts only — no handlers, schemas, or buses implemented here.
