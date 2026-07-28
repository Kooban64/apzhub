# Delivery State Machine

Reuse repository contract terminology (`@apzhub/notification-contracts` lifecycle).

## Delivery statuses (authoritative)

| Status              | Meaning                                      |
| ------------------- | -------------------------------------------- |
| `requested`         | Created; not yet eligible                    |
| `queued`            | Eligible for claim                           |
| `processing`        | Claimed / dispatching                        |
| `delivered`         | Terminal success                             |
| `retry_scheduled`   | Transient failure; wait `next_attempt_at`    |
| `permanent_failure` | Terminal failure (may set `deadLetter=true`) |
| `cancelled`         | Terminal cancel                              |
| `expired`           | Terminal expiry                              |
| `suppressed`        | Terminal policy/preference suppression       |

Transitions remain gated by `assertNotificationDeliveryTransition`.

## Intent aggregate statuses

Retain existing intent statuses (`requested`→`validated`→`queued`→`processing`→`delivered`/`partially_delivered`/terminal). Durable runtime must persist intent transitions in Postgres.

## Mapping to Owner vocabulary

| Owner term                         | Repository status                  |
| ---------------------------------- | ---------------------------------- |
| pending/eligible                   | `queued` / `retry_scheduled` due   |
| claimed/dispatching                | `processing`                       |
| retryable failure                  | `retry_scheduled`                  |
| permanently failed / dead-lettered | `permanent_failure` + `deadLetter` |
| cancelled/suppressed               | `cancelled` / `suppressed`         |
