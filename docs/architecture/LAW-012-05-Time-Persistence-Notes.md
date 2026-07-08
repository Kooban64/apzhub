# LAW-012-05 — Time Persistence Notes

> **Story:** LAW-012-05 — Calendar + Time Persistence  
> **Scope:** Time entry aggregate only

---

## Overview

Time entries persist as `ManagedTimeEntry` — the domain `TimeEntry` type plus optional task/document links, start/end times, and `createdAt`. Billing fields (`rate`, `amount`, `billingStatus`) are stored but invoice/billing persistence remains out of scope.

---

## Schema

Table: `law_time_entry` (migration `0005_law_calendar_time.sql`)

| Column                                              | Purpose                               |
| --------------------------------------------------- | ------------------------------------- |
| `time_entry_id`                                     | Primary key                           |
| `tenant_id`                                         | Multi-tenant isolation                |
| `matter_id`                                         | Required matter link                  |
| `task_id`, `document_id`                            | Optional links                        |
| `time_entry_reference`                              | Unique per tenant (`TIM-YYYY-NNNNNN`) |
| `user_id`, `entry_date`, `duration_minutes`         | Core time data                        |
| `narrative`, `activity_code`                        | Description                           |
| `billable`, `billing_status`, `rate`, `amount`      | Billing metadata (no invoice linkage) |
| `approved_by_user_id`                               | Approval workflow placeholder         |
| `start_time`, `end_time`                            | Optional interval                     |
| `created_at`, `version`, `deleted_at`, `updated_at` | Audit + soft delete                   |

---

## Repository layers

| Layer          | Path                                                                |
| -------------- | ------------------------------------------------------------------- |
| Row mapper     | `packages/config/src/db/law-mappers/time-entry-row-mapper.ts`       |
| Config adapter | `packages/config/src/db/adapters/postgres-time-entry-repository.ts` |
| App wrapper    | `apps/law-platform/lib/time/postgres-time-entry-repository.ts`      |
| Filters        | `apps/law-platform/lib/time/time-entry-repository-filters.ts`       |

---

## Relationship validation

On **create** and **update**:

1. `matterId` exists for tenant.
2. `taskId` exists and belongs to the same matter when supplied.
3. `documentId` exists and belongs to the same matter when supplied.

---

## Soft delete

Matches in-memory behaviour: sets `deleted_at`, excludes from `list()` / `getById()`, emits `legal.time.deleted`.

---

## Outbox events

| Event                | Trigger        |
| -------------------- | -------------- |
| `legal.time.created` | `create()`     |
| `legal.time.updated` | `update()`     |
| `legal.time.deleted` | `softDelete()` |

Aggregate type: `time`.

---

## Repository mode

Factory: `getSharedTimeEntryRepository()` / `createTimeEntryRepositoryForContext()`.

Postgres seed: 42 time entries after clients/matters/documents/tasks.
