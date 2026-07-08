# LAW-012-04 — Document Persistence Notes

> **Story:** LAW-012-04 — Document + Task Persistence  
> **Scope:** Document aggregate only

---

## Overview

Documents are persisted as **metadata only** — no binary file storage, no external object store, no upload pipeline. The `Document` domain type from `@apzhub/legal-business-core` maps 1:1 to `law_document`.

---

## Schema

Table: `law_document` (migration `0003_law_document_task.sql`)

| Column                                            | Purpose                               |
| ------------------------------------------------- | ------------------------------------- |
| `document_id`                                     | Primary key (prefixed domain ID)      |
| `tenant_id`                                       | Multi-tenant isolation                |
| `matter_id`                                       | Required matter link                  |
| `client_id`                                       | Optional denormalised client link     |
| `document_reference`                              | Unique per tenant (`DOC-YYYY-NNNNNN`) |
| `title`, `document_type`, `document_status`       | Core metadata                         |
| `document_category_id`, `folder_id`               | Classification / organisation         |
| `version`, `file_name`, `mime_type`, `size_bytes` | File metadata (no blob)               |
| `created_by_user_id`, `tags`, `custom_fields`     | Audit + extensibility                 |
| `archived_at`                                     | Soft archive marker                   |
| `created_at`, `updated_at`                        | Timestamps                            |

---

## Repository layers

| Layer          | Path                                                               |
| -------------- | ------------------------------------------------------------------ |
| Drizzle schema | `packages/config/src/db/legal-schema.ts`                           |
| Row mapper     | `packages/config/src/db/law-mappers/document-row-mapper.ts`        |
| Config adapter | `packages/config/src/db/adapters/postgres-document-repository.ts`  |
| App wrapper    | `apps/law-platform/lib/documents/postgres-document-repository.ts`  |
| In-memory      | `apps/law-platform/lib/documents/in-memory-document-repository.ts` |
| Filters        | `apps/law-platform/lib/documents/document-repository-filters.ts`   |

---

## Relationship validation

On **create** and **update**, the PostgreSQL adapter validates:

1. `matterId` exists for the current tenant (non-archived matter).
2. Throws `Matter not found for tenant: {matterId}` when invalid.

Workflow-layer validation (`document-validation.ts`) also checks matter existence via `getSharedMatterRepository()` (factory-aware for postgres mode).

---

## Soft archive

Matches in-memory behaviour:

- Sets `document_status = 'archived'`
- Sets `archived_at` timestamp
- Excludes archived rows from `list()` / `getById()`

---

## Outbox events

Written transactionally when `LAW_OUTBOX_ENABLED=true` (default in postgres mode):

| Event                     | Trigger         |
| ------------------------- | --------------- |
| `legal.document.created`  | `create()`      |
| `legal.document.updated`  | `update()`      |
| `legal.document.archived` | `softArchive()` |

Aggregate type: `document`. No workers or replay.

---

## Repository mode

- `LAW_REPOSITORY_MODE=memory` (default) — in-memory seed data (20 documents)
- `LAW_REPOSITORY_MODE=postgres` — PostgreSQL with tenant session + RLS

Factory: `getSharedDocumentRepository()` / `createDocumentRepositoryForContext()`.

Seed order in postgres mode: clients → matters → documents.
