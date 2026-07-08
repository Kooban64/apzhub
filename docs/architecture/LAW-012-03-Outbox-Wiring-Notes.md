# LAW-012-03 — Outbox Wiring Notes

## What changed

Outbox records are now written **inside the same PostgreSQL transaction** as Client/Matter mutations when:

- `LAW_REPOSITORY_MODE=postgres`
- `LAW_OUTBOX_ENABLED` is not `false` (default: enabled in postgres mode)

---

## Event types recorded

| Aggregate | Mutations   | Outbox `event_type`     |
| --------- | ----------- | ----------------------- |
| Client    | create      | `legal.client.created`  |
| Client    | update      | `legal.client.updated`  |
| Client    | softDelete  | `legal.client.deleted`  |
| Matter    | create      | `legal.matter.created`  |
| Matter    | update      | `legal.matter.updated`  |
| Matter    | softArchive | `legal.matter.archived` |

---

## Implementation path

```text
Postgres*Repository (law-platform wrapper)
  → onOutboxEvent callback
    → recordOutboxEvent(context, tx, draft)
      → INSERT law_outbox_event (same tx)
```

Config adapters invoke `onOutboxEvent` after successful row mutation within `runInTransaction`.

---

## Explicitly NOT implemented

| Feature               | Status                                 |
| --------------------- | -------------------------------------- |
| Outbox worker         | Not implemented                        |
| Event replay          | Not implemented                        |
| Retries / DLQ         | Not implemented                        |
| In-memory mode outbox | Disabled (`isOutboxEnabled()` = false) |

---

## Configuration

| Variable             | Default                | Effect                               |
| -------------------- | ---------------------- | ------------------------------------ |
| `LAW_OUTBOX_ENABLED` | `true` (postgres mode) | Set `false` to disable outbox writes |

---

## Tests

- `apps/law-platform/lib/clients/outbox-wiring.integration.test.ts` — verifies row created on client create (postgres only)
