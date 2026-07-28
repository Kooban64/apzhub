# Data Model (Logical)

Prefer extending **0065** entities:

| Entity                                  | Role                                 |
| --------------------------------------- | ------------------------------------ |
| `platform_notification_intent`          | Intent SoR                           |
| `platform_notification_delivery_record` | Delivery SoR + queue/retry/DLQ flags |
| `platform_notification_delivery_try`    | Attempt SoR                          |
| `platform_notification_in_app_item`     | In-app projection                    |

## Additive fields likely required (ENG, not this ADR)

On delivery record: `claimed_by`, `claimed_at`, `lease_expires_at` (if absent).  
On try: `provider_reference` (for future providers).

## Keys / indexes

Retain unique `(tenant_id, idempotency_key)` on intent/delivery.  
Retain queue index `(status, next_attempt_at)`.  
Add lease expiry index for reclaim scans.

## Ownership

Notification Delivery plane only. No Email SoR tables. No duplicate Observe/Support entities.
