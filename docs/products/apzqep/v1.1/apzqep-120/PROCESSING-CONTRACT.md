# Processing Contract — APZQEP-120-S09

## Canonical lifecycle

```text
Event
  → Processor
    → Processing Result
      → Acknowledged
      or Retry
      or Dead Letter
```

## Store statuses ↔ lifecycle

| Lifecycle    | Store status        |
| ------------ | ------------------- |
| Event        | `pending`           |
| Reserved     | `reserved`          |
| Leased       | `leased`            |
| Executing    | `processing`        |
| Acknowledged | `acknowledged`      |
| Retry        | `retry_scheduled`   |
| Dead Letter  | `dead_letter_ready` |
| Cancelled    | `cancelled`         |

## Standard execution model

All future event consumers (Search, Notifications, QI, AI, …) SHALL implement the `EventProcessor` interface and register with the Processor Registry. They SHALL NOT bypass the engine.
