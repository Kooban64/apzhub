# Idempotency Design

| Boundary          | Key                                     | Uniqueness                           | On duplicate              |
| ----------------- | --------------------------------------- | ------------------------------------ | ------------------------- |
| Intent create     | `(tenant_id, idempotency_key)`          | DB unique 0065                       | Return existing intent    |
| Delivery create   | `(tenant_id, delivery.idempotency_key)` | DB unique 0065                       | Return existing delivery  |
| Claim             | Row PK + lease                          | Row lock                             | Other workers skip        |
| Provider dispatch | `provider_reference` (future) + try     | Unique when non-null                 | Treat as already accepted |
| Automatic retry   | Same delivery_id + new attempt_number   | Unique (delivery_id, attempt_number) | Continue chain            |
| Manual replay     | `replay:<original_delivery_id>:<n>`     | New delivery idempotency             | New chain                 |

## Duplicate detection

- Intake: unique violation → fetch existing
- Worker: never dispatch without claim
- Post-crash: if try exists unfinished and lease expired → reclaim without double-counting attempts incorrectly (ENG-001B: unfinished try closed as `internal_processing` before reclaim)

## Provider reference handling

In-app Phase B of ENG-001B: set `provider_reference = in_app_notification_id` when created.  
External providers (ADR-0074 later): store provider message id.

## Replay / manual retry rules

- Replay creates new delivery (see STATE-MACHINE)
- Manual retry of `retry_scheduled` may set `next_attempt_at=now()` (same delivery) — privileged
- Never delete historical tries
