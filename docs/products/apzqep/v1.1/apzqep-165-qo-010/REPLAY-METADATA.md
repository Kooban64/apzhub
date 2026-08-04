# Replay Metadata

Each envelope may carry replay metadata:

| Field              | Meaning                         |
| ------------------ | ------------------------------- |
| Replay Eligibility | Whether replay is allowed later |
| Replay Window      | Optional hours window           |
| Replay Reference   | Opaque replay ref               |
| Replay Status      | not_requested / eligible / …    |

**Replay execution is not implemented** in QO-010 — metadata only.

## Future durable event store

Process-local persistence matches QO-001…QO-009. A durable event-store implementation is deferred to a later hardening slice — not redesigned here.
