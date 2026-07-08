# LAW-012-02 — Outbox Skeleton Notes

## Purpose

The outbox table provides a foundation for reliable domain event delivery to search projections, audit, and analytics workers — per LAW-012-01 §6.2 and §8.

## Table: `law_outbox_event`

| Column            | Type         | Notes                                |
| ----------------- | ------------ | ------------------------------------ |
| `outbox_event_id` | text PK      | Generated via `createEntityId("ob")` |
| `tenant_id`       | text         | Tenant scope                         |
| `aggregate_type`  | varchar(64)  | `client` \| `matter` (extensible)    |
| `aggregate_id`    | text         | Aggregate root ID                    |
| `event_type`      | varchar(128) | e.g. `legal.client.created`          |
| `payload`         | jsonb        | Event payload                        |
| `created_at`      | timestamptz  | Insert time                          |
| `published_at`    | timestamptz  | NULL until worker publishes          |

## API

```typescript
// apps/law-platform/lib/persistence/outbox-skeleton.ts
recordOutboxEvent(context, db, draft);
```

## Explicitly NOT implemented (LAW-012-02)

| Feature              | Status                                                           |
| -------------------- | ---------------------------------------------------------------- |
| Outbox worker        | Not implemented                                                  |
| Event replay         | Not implemented                                                  |
| Retry / dead letter  | Not implemented                                                  |
| Workflow integration | Not wired — workflows still publish to in-process event bus only |

## LAW-012-03 recommendation

Wire `recordOutboxEvent()` into UoW commit hooks for Client and Matter mutations, then implement a projection worker that reads unpublished rows (`published_at IS NULL`).
