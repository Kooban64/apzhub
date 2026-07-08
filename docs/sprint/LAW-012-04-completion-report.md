# LAW-012-04 — Completion Report

> **Story:** LAW-012-04 — Document + Task Persistence  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Prerequisite:** [LAW-012-03](./LAW-012-03-completion-report.md)

---

## 1. Objective

Extend the hardened Client + Matter persistence foundation to **Documents** and **Tasks** (metadata only). Client/Matter unchanged except relationship validation paths.

**Result:** Achieved. PostgreSQL adapters, schema, migrations, RLS, outbox, factory wiring, and tests delivered. Calendar, Time, Billing, APIs, Trust Accounting, and file storage remain out of scope.

---

## 2. Deliverables

| Deliverable                                 | Location                                                              | Status |
| ------------------------------------------- | --------------------------------------------------------------------- | ------ |
| Drizzle schema (`law_document`, `law_task`) | `packages/config/src/db/legal-schema.ts`                              | ✅     |
| Migration 0003 (tables)                     | `packages/config/drizzle/0003_law_document_task.sql`                  | ✅     |
| Migration 0004 (RLS)                        | `packages/config/drizzle/0004_law_document_task_rls.sql`              | ✅     |
| Document row mapper + adapter               | `document-row-mapper.ts`, `postgres-document-repository.ts`           | ✅     |
| Task row mapper + adapter                   | `task-row-mapper.ts`, `postgres-task-repository.ts`                   | ✅     |
| Outbox drafts (7 event types)               | `outbox-drafts.ts`                                                    | ✅     |
| App wrappers + UoW                          | `lib/documents/postgres-*`, `lib/tasks/postgres-*`, `unit-of-work.ts` | ✅     |
| Repository factory wiring                   | `repository-factory.ts`                                               | ✅     |
| Session/persistence context binding         | `create-app-action-executor.ts`                                       | ✅     |
| Validation factory imports                  | `document-validation.ts`, `task-validation.ts`                        | ✅     |
| Document persistence notes                  | `docs/architecture/LAW-012-04-Document-Persistence-Notes.md`          | ✅     |
| Task persistence notes                      | `docs/architecture/LAW-012-04-Task-Persistence-Notes.md`              | ✅     |
| Migration notes                             | `docs/architecture/LAW-012-04-Migration-Notes.md`                     | ✅     |
| RLS update notes                            | `docs/architecture/LAW-012-04-RLS-Update-Notes.md`                    | ✅     |

---

## 3. Outbox events

| Event                     | Aggregate |
| ------------------------- | --------- |
| `legal.document.created`  | document  |
| `legal.document.updated`  | document  |
| `legal.document.archived` | document  |
| `legal.task.created`      | task      |
| `legal.task.updated`      | task      |
| `legal.task.completed`    | task      |
| `legal.task.archived`     | task      |

No workers, replay, or queues.

---

## 4. Test report

| Metric                | After LAW-012-04                                   |
| --------------------- | -------------------------------------------------- |
| Test files            | **330**                                            |
| Tests passing         | **1511**                                           |
| Skipped               | **21** (postgres integration when DB unavailable)  |
| Pre-existing failures | **2** (env config in postgres factory smoke tests) |

### New tests

| File                                               | Coverage                                                        |
| -------------------------------------------------- | --------------------------------------------------------------- |
| `writable-document-repository.contract.test.ts`    | Memory contract (list, filter, CRUD, archive)                   |
| `writable-task-repository.contract.test.ts`        | Memory contract + document link                                 |
| `postgres-document-repository.integration.test.ts` | PG contract + tenant isolation                                  |
| `postgres-task-repository.integration.test.ts`     | PG contract + tenant isolation + relationship validation        |
| `document-task-outbox-wiring.integration.test.ts`  | Transactional outbox for document create, task complete/archive |
| `persistence-foundation.test.ts`                   | Extended for document/task factory modes                        |

### Compatibility

Existing document/task workflow integration tests pass in memory mode. Matter lifecycle E2E unchanged.

---

## 5. Technical debt

| ID     | Description                                                             | Priority |
| ------ | ----------------------------------------------------------------------- | -------- |
| TD-P02 | Auth has no real tenant claim — single-firm fallback only               | High     |
| TD-P04 | `runSync()` sync bridge remains                                         | Medium   |
| TD-P11 | No DB foreign keys on matter/document relationships                     | Medium   |
| TD-P12 | Postgres factory smoke tests require full env when `DATABASE_URL` unset | Low      |
| TD-P13 | Task `completeTask()` outbox only via repository update path            | Low      |

---

## 6. Recommendation for LAW-012-05

**Proposed scope: Calendar + Time persistence**

Rationale:

1. Document/Task patterns are established — next workflow aggregates with matter links are Calendar and Time entries.
2. Both already have in-memory repositories, workflow services, and seed data.
3. Calendar events share similar metadata-only constraints (no external calendar sync).
4. Time entries link to matters and optionally tasks — reuse relationship validation pattern from LAW-012-04.

Suggested LAW-012-05 deliverables:

- `law_calendar_event` + `law_time_entry` schema
- Migrations 0005/0006 (tables + RLS)
- PostgreSQL adapters with outbox events
- Factory wiring + contract/integration tests
- Defer Billing, Trust Accounting, APIs, and file storage

**Stop condition:** Await owner approval before LAW-012-05 execution.

---

## 7. Repository mode

| Mode       | Default | Env var                        |
| ---------- | ------- | ------------------------------ |
| Memory     | ✅ Yes  | `LAW_REPOSITORY_MODE=memory`   |
| PostgreSQL | Opt-in  | `LAW_REPOSITORY_MODE=postgres` |

---

## 8. Files changed (summary)

**Config package:** schema, mappers, adapters, outbox drafts, migration verification, index exports, migrations 0003/0004.

**Law platform:** postgres wrappers, filter extraction, repository factory, UoW, validation imports, action executor wiring, test utilities, integration/contract tests.

**Docs:** completion report + 4 architecture notes.
