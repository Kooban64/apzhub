# Completion Model

| Path        | Persist API                  | Delivery status                          | Lease   |
| ----------- | ---------------------------- | ---------------------------------------- | ------- |
| Success     | `completeDeliverySuccess`    | `delivered`                              | cleared |
| Retry       | `completeDeliveryRetry`      | `retry_scheduled` + `next_attempt_at`    | cleared |
| Dead-letter | `completeDeliveryDeadLetter` | `permanent_failure` + `dead_letter=true` | cleared |

All completion writes require `status=processing` and `claimed_by=workerId`. Stale workers receive `null` / `fencing_rejected`.
