# APZQEP-OES-ENG-060B

# PART 4 — REST Resource Catalogue, Search & Permissions

| Item     | Value                                       |
| -------- | ------------------------------------------- |
| Document | **APZQEP-OES-ENG-060B**                     |
| Part     | **4 of 5**                                  |
| Status   | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. REST principles

| Principle                     | Rule                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| One client API                | All traffic via APZHUB API Gateway path (Document 010)      |
| Versioned                     | `/api/v1/...`                                               |
| Envelope                      | Platform standard `{ data, meta }` / `{ data, page, meta }` |
| Authn/Authz                   | Platform pipeline; permission-gated                         |
| No business logic in handlers | Handlers map HTTP ↔ Application commands/queries            |
| No backend leakage            | Errors use typed categories — not raw DB/driver errors      |
| Correlation                   | Propagate correlation id end-to-end                         |

This Part specifies **resources and operations** only — not controllers or route handler code.

---

## 2. Resource catalogue

**Base:** `/api/v1/qep/plans`

| Resource        | Path                                                                       | Operations                                                    |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Plan collection | `/api/v1/qep/plans`                                                        | `GET` list/search · `POST` create                             |
| Plan            | `/api/v1/qep/plans/{planId}`                                               | `GET` · `PATCH` update (content/metadata; `expectedRevision`) |
| Plan actions    | `/api/v1/qep/plans/{planId}/actions/{action}`                              | `POST` lifecycle/governance actions                           |
| Plan items      | `/api/v1/qep/plans/{planId}/items`                                         | `GET` · `POST` add                                            |
| Plan item       | `/api/v1/qep/plans/{planId}/items/{itemId}`                                | `PATCH` · `DELETE` (remove)                                   |
| Item reorder    | `/api/v1/qep/plans/{planId}/items:reorder` **or** `POST .../items/reorder` | Reorder                                                       |
| History         | `/api/v1/qep/plans/{planId}/history`                                       | `GET`                                                         |
| Versions        | `/api/v1/qep/plans/{planId}/versions`                                      | `GET`                                                         |
| Compare         | `/api/v1/qep/plans/{planId}/compare`                                       | `GET` (query: from/to)                                        |
| Clone           | `/api/v1/qep/plans/{planId}/clone`                                         | `POST`                                                        |

### 2.1 Action names (`{action}`)

| Action               | Maps to command   |
| -------------------- | ----------------- |
| `submit-for-review`  | SubmitForReview   |
| `approve`            | ApprovePlan       |
| `reject`             | RejectPlan        |
| `return-to-draft`    | ReturnToDraft     |
| `mark-ready`         | MarkReady         |
| `start-execution`    | StartExecution    |
| `complete`           | CompletePlan      |
| `archive`            | ArchivePlan       |
| `cancel`             | CancelPlan        |
| `supersede`          | SupersedePlan     |
| `transfer-ownership` | TransferOwnership |
| `assign`             | UpdateAssignment  |
| `schedule`           | UpdateSchedule    |

ENG-060B **MAY** expose ownership/assignment/schedule as `PATCH` fields instead of actions if OpenAPI clarity improves — behavioural mapping to Domain **MUST** remain identical.

### 2.2 Request / response concepts

| Concept       | Requirement                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan DTO      | id, number, tenantId, title, objective, status, scope, priority, ownership/assignment, schedule, revision, lineage, metrics summary, timestamps, `availableActions` |
| Item DTO      | id, specificationId, version pin, sequence, item status, notes                                                                                                      |
| List          | Collection envelope with `page`                                                                                                                                     |
| Mutating body | Include `expectedRevision` where concurrent                                                                                                                         |
| Errors        | Typed error category + code + correlationId (Part 5) — **no HTTP status table in this OES** (ENG/OpenAPI binds statuses)                                            |

---

## 3. Search architecture

### 3.1 Role

Platform Search Service (Document 020) holds a **derived** index. PostgreSQL remains SoR.

### 3.2 Searchable fields

| Field                              | Indexed           |
| ---------------------------------- | ----------------- |
| number                             | Yes               |
| title                              | Yes               |
| objective / description            | Yes (full-text)   |
| status                             | Yes (filter)      |
| scope / plan type                  | Yes (filter)      |
| ownerId / leadId                   | Yes (filter)      |
| linked specification ids / numbers | Yes               |
| tags                               | Yes               |
| planned start/end                  | Yes (range)       |
| revision / version label           | Yes               |
| updatedAt / createdAt              | Yes (sort/filter) |

### 3.3 Filter / sort / pagination model

Align with repository list port (Part 2): max `pageSize` 50; permission filter **at query time**; default exclude terminal archived/cancelled/superseded unless requested.

### 3.4 Indexing requirements

| Requirement       | Rule                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Upsert            | After successful create/update/lifecycle persist                                                    |
| Delete/tombstone  | On cancel/supersede/archive as appropriate for search UX (document choice in ENG; SoR retains rows) |
| No business logic | Projection mapper only                                                                              |
| Async             | Indexing **MUST NOT** block user response beyond enqueue/outbox                                     |

Module-local search engines are **forbidden**.

---

## 4. Permissions

### 4.1 Catalogue

| Permission              | Allows                                               |
| ----------------------- | ---------------------------------------------------- |
| `qep.plan.read`         | View plans (list/detail/history/versions as granted) |
| `qep.plan.create`       | Create                                               |
| `qep.plan.update`       | Edit draft/rejected content, items, return-to-draft  |
| `qep.plan.submit`       | Submit for review                                    |
| `qep.plan.approve`      | Approve                                              |
| `qep.plan.reject`       | Reject                                               |
| `qep.plan.ready`        | Mark ready                                           |
| `qep.plan.execute`      | Start execution                                      |
| `qep.plan.complete`     | Complete                                             |
| `qep.plan.archive`      | Archive                                              |
| `qep.plan.cancel`       | Cancel                                               |
| `qep.plan.clone`        | Clone                                                |
| `qep.plan.supersede`    | Supersede                                            |
| `qep.plan.assign`       | Update assignment                                    |
| `qep.plan.schedule`     | Update schedule                                      |
| `qep.plan.search`       | Use search endpoints                                 |
| `qep.plan.history.view` | View history (if separated from read)                |

`qep.plan.history.view` **MAY** be implied by `qep.plan.read` in ENG-060B if Role mapping prefers fewer grants — document the choice; default = implied by read.

### 4.2 Role translation (architectural — not backend role names in UI)

| Architectural role | Typical grants                                                 |
| ------------------ | -------------------------------------------------------------- |
| Viewer             | read (+ search/history)                                        |
| Tester             | read; limited assign notes if Owner configures                 |
| Lead               | create, update, submit, assign, schedule, ready, clone         |
| QA Manager         | approve, reject, supersede, archive, cancel, complete, execute |
| Administrator      | catalogue/config only — not audit bypass                       |
| Superadmin         | Explicit tier; audited; not a silent bypass                    |

Exact Role→Permission maps live in Platform PermissionService configuration (ENG programme), not in Domain.

### 4.3 Enforcement

Infrastructure **SHALL** check permissions before Domain invocation. Domain **SHALL NOT** implement authz.

---

## STOP (Part 4)
