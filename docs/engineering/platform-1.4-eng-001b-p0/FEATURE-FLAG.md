# Feature Flag — APZHUB_NOTIFICATION_DURABLE_RUNTIME

| Field             | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| Name              | `APZHUB_NOTIFICATION_DURABLE_RUNTIME`                            |
| Default           | **OFF** (unset / false / empty)                                  |
| Truthy            | `true` · `1` · `on`                                              |
| Helper            | `isNotificationDurableRuntimeEnabled(env)`                       |
| Phase 0 behaviour | Flag readable only; bootstrap **never** attaches a durable store |

## Related flags (unchanged)

- `APZHUB_NOTIFICATION_DELIVERY_ENABLED` — deny-by-default delivery plane
- `APZHUB_NOTIFICATION_WORKER_ENABLED` — Phase A in-process worker

## Env examples

Documented (commented) in `.env.example` and `.env.production.example`.

## Activation

**Do not activate** under Phase 0. Cut-over requires later ENG-001B phases + Owner Approval.
