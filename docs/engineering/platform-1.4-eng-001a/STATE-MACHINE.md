# State Machine Design

Authoritative transitions: `@apzhub/notification-contracts` `NOTIFICATION_DELIVERY_TRANSITIONS` / intent transitions. ENG-001B must continue calling `assertNotification*Transition`.

## Delivery statuses

| Status              | Meaning                          | Timeout / notes                    |
| ------------------- | -------------------------------- | ---------------------------------- |
| `requested`         | Created                          | Short-lived; should queue promptly |
| `queued`            | Claimable                        | —                                  |
| `processing`        | Claimed / dispatching            | Bound by `lease_expires_at`        |
| `delivered`         | Terminal success                 | —                                  |
| `retry_scheduled`   | Wait `next_attempt_at`           | Becomes claimable when due         |
| `permanent_failure` | Terminal; may `dead_letter=true` | —                                  |
| `cancelled`         | Terminal                         | Manual/admin                       |
| `expired`           | Terminal                         | Intent/delivery expiry             |
| `suppressed`        | Terminal                         | Policy/preference                  |

## Valid delivery paths (summary)

- intake → `requested` → `queued` → `processing` → `delivered`
- `processing` → `retry_scheduled` → (`queued`|`processing`) → …
- `processing` → `permanent_failure` (+ DLQ flag)
- any non-terminal → `cancelled` / `expired` where allowed
- `requested`/`queued` → `suppressed`

## Invalid

Any transition not in `NOTIFICATION_DELIVERY_TRANSITIONS` — throw / reject.

## Retry path

Transient failure + attempts < max → `retry_scheduled` with backoff `next_attempt_at`.  
When due, claim may move `retry_scheduled`→`processing` directly (allowed) or via `queued`.

## Dead-letter path

Permanent failure class OR attempts exhausted → `permanent_failure` + `dead_letter=true`.

## Manual replay

From `permanent_failure` (dead-lettered): **not** a direct lifecycle reverse. Design: create **new** delivery row (new idempotency key namespace `replay:<id>:<n>`) or Owner-approved extension adding explicit `permanent_failure`→`queued` transition in contracts (prefer **new delivery** to keep terminal states immutable).

**ENG-001A decision:** Prefer **new delivery record** linked via metadata `replay_of_delivery_id` to preserve terminal immutability without breaking lifecycle contracts.

## Suppression / cancellation

Policy/preference → `suppressed`. Admin cancel → `cancelled` when transition allowed; release lease if cancelling `processing` owned row.
