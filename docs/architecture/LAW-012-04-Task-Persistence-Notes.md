# LAW-012-04 — Task Persistence Notes

> **Story:** LAW-012-04 — Document + Task Persistence  
> **Scope:** Task aggregate only

---

## Overview

Tasks persist as `ManagedTask` — the domain `Task` type plus `documentId?` and `createdAt`. Stored in `law_task` with optional document linkage.

---

## Schema

Table: `law_task` (migration `0003_law_document_task.sql`)

| Column                          | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `task_id`                       | Primary key                           |
| `tenant_id`                     | Multi-tenant isolation                |
| `matter_id`                     | Required matter link                  |
| `client_id`                     | Optional denormalised client          |
| `document_id`                   | Optional document link (same matter)  |
| `task_reference`                | Unique per tenant (`TSK-YYYY-NNNNNN`) |
| `title`, `description`          | Core content                          |
| `task_status`, `task_priority`  | Workflow state                        |
| `assignee_user_id`              | Assignment                            |
| `due_at`, `completed_at`        | Scheduling                            |
| `workflow_step_id`              | Future workflow integration           |
| `tags`, `created_at`, `version` | Metadata                              |
| `archived_at`                   | Soft archive marker                   |
| `updated_at`                    | Last mutation                         |

---

## Repository layers

| Layer          | Path                                                          |
| -------------- | ------------------------------------------------------------- |
| Row mapper     | `packages/config/src/db/law-mappers/task-row-mapper.ts`       |
| Config adapter | `packages/config/src/db/adapters/postgres-task-repository.ts` |
| App wrapper    | `apps/law-platform/lib/tasks/postgres-task-repository.ts`     |
| In-memory      | `apps/law-platform/lib/tasks/in-memory-task-repository.ts`    |
| Filters        | `apps/law-platform/lib/tasks/task-repository-filters.ts`      |

---

## Relationship validation

On **create** and **update**, the PostgreSQL adapter validates:

1. `matterId` is present and exists for the tenant (non-archived).
2. When `documentId` is supplied, the document exists for the tenant and `document.matterId === task.matterId`.

Workflow validation (`task-validation.ts`) mirrors these rules via factory-backed shared repositories.

---

## Task completion outbox

`completeTask()` in the workflow calls `repository.update()` with `taskStatus: "completed"`. The postgres adapter detects status transition to `completed` and emits `legal.task.completed` instead of `legal.task.updated`.

---

## Soft archive

Matches in-memory behaviour:

- Sets `task_status = 'cancelled'`
- Sets `archived_at`
- Excludes from active queries

---

## Outbox events

| Event                  | Trigger                                    |
| ---------------------- | ------------------------------------------ |
| `legal.task.created`   | `create()`                                 |
| `legal.task.updated`   | `update()` (non-completion)                |
| `legal.task.completed` | `update()` when status becomes `completed` |
| `legal.task.archived`  | `softArchive()`                            |

Aggregate type: `task`.

---

## Repository mode

- Default memory mode: 32 seed tasks linked to matters/documents
- Postgres mode: seed order clients → matters → documents → tasks

Factory: `getSharedTaskRepository()` / `createTaskRepositoryForContext()`.
