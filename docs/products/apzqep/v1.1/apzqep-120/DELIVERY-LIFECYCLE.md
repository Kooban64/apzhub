# Delivery Lifecycle — APZQEP-120-S08

## Owner lifecycle states

| State             | Store status  | Meaning                                   |
| ----------------- | ------------- | ----------------------------------------- |
| Pending           | `pending`     | Durably enqueued; not yet claimed         |
| Reserved          | `processing`  | Claimed / locked for delivery             |
| Delivering        | `processing`  | Transport handler in flight               |
| Delivered         | `published`   | Transport acknowledged                    |
| Failed            | `failed`      | Transient terminal before retry schedule  |
| Retry Scheduled   | `retrying`    | Backoff until `nextAttemptAt`             |
| Dead Letter Ready | `dead-letter` | Retries exhausted or permanent failure    |
| Cancelled         | `cancelled`   | Explicit cancel (pending/retrying/failed) |

## Deterministic transitions

```text
Pending → Reserved → Delivering → Delivered
                              └→ Failed → Retry Scheduled → Reserved …
                              └→ Failed → Dead Letter Ready
Pending | Retry Scheduled → Cancelled
```

## Crash / restart recovery

1. Claim moves row to `processing` (Reserved).
2. If the process crashes before markPublished / markFailed, recovery returns the row to `retrying` (or `pending`) for reclaim.
3. Drain is idempotent at transport boundary via Null transport message ids and catalogue `idempotencyKey` on enqueue.

## Sequence (happy path)

```text
App.publish → enqueue(Pending)
Dispatcher.claimBatch → Reserved
Transport.deliver → Delivering
markPublished → Delivered
observability.onAttempt(outcome=delivered)
```
