# APZQEP-OES-ENG-060B

# PART 2 — Repository Layer & Persistence Model

| Item     | Value                                       |
| -------- | ------------------------------------------- |
| Document | **APZQEP-OES-ENG-060B**                     |
| Part     | **2 of 5**                                  |
| Status   | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Repository responsibilities

Infrastructure **SHALL** provide a `TestPlanRepository` port (name MAY vary; responsibilities MUST not) with these capabilities:

| Responsibility       | Requirement                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| Create               | Persist a new aggregate head + children in one transaction                |
| Get by id            | Load full aggregate for a tenant or return not-found                      |
| Get by number        | Optional lookup by human-readable plan number within tenant               |
| Save                 | Persist mutations with optimistic concurrency (`expectedRevision`)        |
| Exists               | Cheap existence check (id and/or number)                                  |
| List                 | Filtered, sorted, paginated projections (not necessarily full aggregates) |
| History              | Append and read append-only history records                               |
| Versions / revisions | Persist sealed revision snapshots; list revision metadata                 |
| Allocate number      | Allocate unique tenant-scoped plan number (Application/Infrastructure)    |

Domain **SHALL NOT** call the database. Application handlers **SHALL** be the only callers of the repository port for write paths.

---

## 2. Aggregate reconstruction

On `get`:

1. Load head row from `qep_test_plans`.
2. Load child rows: items, current assignment, schedule, approval records, revision metadata as required.
3. Reconstruct a Domain `TestPlan` aggregate instance using Domain factories / rehydrate helpers exposed by `@apzhub/qep-test-plans` (or equivalent pure mapping into Domain create/rehydrate API).
4. **SHALL NOT** invent status transitions during load.
5. **SHALL** preserve `revision`, lineage ids (`supersedesPlanId` / `supersededByPlanId`), and sealed revision immutability.

Mapping adapters **MAY** translate persistence columns ↔ Domain value objects. Mapping **MUST NOT** apply business rules (e.g. auto-approve, readiness shortcuts).

---

## 3. Optimistic concurrency

| Concern   | Rule                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| Token     | Integer `revision` on aggregate head                                          |
| Write API | `save(plan, expectedRevision)`                                                |
| Match     | Persist only if stored `revision == expectedRevision`                         |
| Success   | Increment `revision` by 1                                                     |
| Failure   | Raise application concurrency conflict; map from / to `PlanConcurrencyError`  |
| REST      | Clients **SHALL** supply `expectedRevision` on mutating operations (ARCH-013) |

---

## 4. Transaction boundaries

| Operation class   | Transaction rule                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Single command    | One DB transaction: persist aggregate + history (+ sealed revision if sealing)                                        |
| Clone / supersede | One transaction covering source update (if any) + successor create + history                                          |
| After-commit      | Audit append, domain-event publish, search upsert **SHOULD** run after successful commit (or via outbox — see Part 5) |
| Queries           | Read-only; no write locks required beyond normal isolation                                                            |

Infrastructure **MUST NOT** leave partial aggregate writes visible across tables without a transaction.

---

## 5. Pagination, filtering, sorting (list port)

List queries **SHALL** support:

| Dimension  | Spec                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Pagination | `page` (1-based) + `pageSize` with platform default; **max pageSize = 50** (ARCH-013)                                |
| Filtering  | status, ownerId, leadId, priority, planType/scope, tags, scheduled window overlap, `q` text, archived inclusion flag |
| Sorting    | `updatedAt`, `createdAt`, `number`, `title`, `status`, `priority`, `plannedStart` — default `updatedAt desc`         |
| Tenant     | Implicit from request context — never client-spoofable                                                               |

List **MAY** return read models / projections rather than full aggregates for performance.

---

## 6. Persistence model (PostgreSQL — logical)

### 6.1 System of record

Platform PostgreSQL is the **System of Record** for Test Plan aggregate data. Search indexes and caches are **derived**, never authoritative (Document 011).

### 6.2 Table catalogue (logical)

| Table                                    | Role                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `qep_test_plans`                         | Aggregate head (SoR)                                                                                           |
| `qep_test_plan_items`                    | Plan items owned by plan                                                                                       |
| `qep_test_plan_approvals`                | Approval / rejection records                                                                                   |
| `qep_test_plan_revisions`                | Sealed revision snapshots + metadata                                                                           |
| `qep_test_plan_history`                  | Append-only history                                                                                            |
| `qep_test_plan_audit` _(optional local)_ | Capability audit trail if Platform Audit requires a local appender table — **MUST NOT** replace Platform Audit |

Assignment and schedule **SHOULD** be columns/JSON on the head **or** dedicated 1:1 tables. Either design is acceptable if reconstruction fidelity is preserved. Recommended v1: columns / structured JSON on `qep_test_plans` for assignment + schedule to minimise joins.

### 6.3 Common columns (all tables)

Every table **SHALL** include:

| Column concept   | Requirement                                                   |
| ---------------- | ------------------------------------------------------------- |
| Primary key      | Platform UUID (`id`)                                          |
| `tenant_id`      | Mandatory; RLS bound                                          |
| Audit timestamps | `created_at`, `updated_at` (history: `occurred_at`)           |
| Audit actors     | `created_by`, `updated_by` where applicable                   |
| Correlation      | Persist `correlation_id` on history/audit rows when available |

### 6.4 Aggregate head (`qep_test_plans`) — required concepts

| Concept                            | Persistence note                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `id`                               | PK UUID                                                                       |
| `tenant_id`                        | Tenant scope                                                                  |
| `number`                           | Human-readable; **unique per tenant**                                         |
| `title`, `objective` / description | Content                                                                       |
| `status`                           | `PlanStatus` string                                                           |
| `plan_type` / `scope`              | Discriminated scope fields; custom scope JSON if needed                       |
| `priority`                         | Enum/string                                                                   |
| `owner_id`, assignment fields      | Actors                                                                        |
| Schedule window                    | Planned start/end / timezone as applicable                                    |
| `revision`                         | Optimistic concurrency integer                                                |
| Lineage                            | `cloned_from_plan_id`, `supersedes_plan_id`, `superseded_by_plan_id`          |
| Metrics                            | Stored projection **MAY** be denormalised; Domain remains source of recompute |
| External references                | JSON array                                                                    |
| Soft-delete                        | **Not used** for Plans v1 — terminal statuses instead                         |

### 6.5 Plan items (`qep_test_plan_items`)

| Concept            | Note                                                    |
| ------------------ | ------------------------------------------------------- |
| `plan_id`          | FK → `qep_test_plans` ON DELETE CASCADE (or equivalent) |
| `specification_id` | Reference only — **no Spec body**                       |
| Version pin        | Spec version reference fields                           |
| Order / sequence   | Stable ordering                                         |
| Item status        | Planning membership state (incl. Removed)               |
| Notes / tags       | As Domain model requires                                |

### 6.6 Approvals (`qep_test_plan_approvals`)

Store reviewer, decision (`approved` / `rejected`), comment, timestamps. Append-oriented; Domain approval state reconstructible.

### 6.7 Revisions (`qep_test_plan_revisions`)

| Concept         | Note                                                                 |
| --------------- | -------------------------------------------------------------------- |
| Sealed snapshot | Full content snapshot at seal/revise points (Infrastructure storage) |
| Immutability    | Rows **MUST NOT** be updated after insert                            |
| Metadata        | revision number, sealed_at, sealed_by, reason                        |

### 6.8 History (`qep_test_plan_history`)

Append-only. Each Domain-significant mutation **SHALL** append a history record (who/what/when + optional before/after summary). History **MUST NOT** be rewritten.

### 6.9 Constraints & indexes (logical)

| Concern      | Requirement                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uniqueness   | `(tenant_id, number)` unique on head                                                                                                                                 |
| FK integrity | Items/approvals/revisions/history → plan                                                                                                                             |
| Indexes      | `(tenant_id, status)`, `(tenant_id, owner_id)`, `(tenant_id, updated_at desc)`, `(tenant_id, number)`, items `(plan_id, sequence)`, history `(plan_id, occurred_at)` |
| RLS          | All tables: `tenant_id = current_setting('app.tenant_id', true)` pattern (mirror Specs)                                                                              |

### 6.10 Soft-delete & restore

| Topic                            | Decision                                                         |
| -------------------------------- | ---------------------------------------------------------------- |
| Soft-delete column               | **NOT USED** in v1                                               |
| Archive                          | Lifecycle status `archived` (Domain) — immutable                 |
| Unarchive / Restore from archive | **NOT AUTHORISED** in v1 (ARCH-013 AR-03)                        |
| `returnToDraft`                  | Domain command (`rejected → draft`) — not archive restore        |
| Session restore                  | Workbench concern (future) — stores plan **ids** + UI state only |

---

## 7. Adapters

| Adapter              | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| PostgreSQL (Drizzle) | Production SoR                                   |
| InMemory             | Unit/integration tests of Application without DB |

Both **MUST** implement the same repository port semantics (including concurrency failures).

---

## 8. Explicit non-delivery (Part 2)

No SQL files · no Drizzle schema code · no migration numbers · no repository TypeScript.

Table DDL and migration numbering are authorised only under **ENG-060B**.

---

## STOP (Part 2)
