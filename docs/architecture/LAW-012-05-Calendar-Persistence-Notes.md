# LAW-012-05 — Calendar Persistence Notes

> **Story:** LAW-012-05 — Calendar + Time Persistence  
> **Scope:** Calendar event aggregate only

---

## Overview

Calendar events persist as `ManagedCalendarEvent` — the domain `CalendarEvent` type plus reference, optional links, and `createdAt`. Metadata only; no external calendar sync.

---

## Schema

Table: `law_calendar_event` (migration `0005_law_calendar_time.sql`)

| Column                                                 | Purpose                               |
| ------------------------------------------------------ | ------------------------------------- |
| `calendar_event_id`                                    | Primary key                           |
| `tenant_id`                                            | Multi-tenant isolation                |
| `matter_id`                                            | Required matter link                  |
| `client_id`, `task_id`, `document_id`, `time_entry_id` | Optional links                        |
| `calendar_event_reference`                             | Unique per tenant (`CAL-YYYY-NNNNNN`) |
| `title`, `event_type`, `calendar_event_status`         | Core metadata                         |
| `starts_at`, `ends_at`, `all_day`                      | Scheduling                            |
| `court_id`, `owner_user_id`, `reminder_minutes`        | Domain fields                         |
| `location`, `description`                              | App-layer metadata                    |
| `created_at`, `version`, `updated_at`                  | Audit                                 |

Cancelled events remain in the table with `calendar_event_status = 'cancelled'`.

---

## Repository layers

| Layer          | Path                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Row mapper     | `packages/config/src/db/law-mappers/calendar-event-row-mapper.ts`       |
| Config adapter | `packages/config/src/db/adapters/postgres-calendar-event-repository.ts` |
| App wrapper    | `apps/law-platform/lib/calendar/postgres-calendar-event-repository.ts`  |
| Filters        | `apps/law-platform/lib/calendar/calendar-event-repository-filters.ts`   |

---

## Relationship validation

On **create** and **update**:

1. `matterId` exists for tenant (non-archived matter).
2. `clientId` exists when supplied (non-deleted client).
3. `taskId` exists and belongs to the same matter when supplied.
4. `documentId` exists and belongs to the same matter when supplied.

---

## Outbox events

| Event                      | Trigger                                      |
| -------------------------- | -------------------------------------------- |
| `legal.calendar.created`   | `create()`                                   |
| `legal.calendar.updated`   | `update()`                                   |
| `legal.calendar.cancelled` | `cancel()` or status transition to cancelled |

Aggregate type: `calendar`.

---

## Repository mode

Factory: `getSharedCalendarEventRepository()` / `createCalendarEventRepositoryForContext()`.

Postgres seed order: clients → matters → documents → tasks → time entries → calendar events (37 seed events).
