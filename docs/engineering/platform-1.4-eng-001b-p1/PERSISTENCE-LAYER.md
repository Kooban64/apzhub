# Persistence Layer — ENG-001B-P1

## Tables (0065 + 0066)

- `platform_notification_intent`
- `platform_notification_delivery_record` (+ lease columns)
- `platform_notification_delivery_try` (+ provider_reference / worker_id)
- `platform_notification_in_app_item`

## Mapping

Mappers convert drizzle rows ↔ contract domain models. Optional lease fields round-trip. `replayOfDeliveryId` is domain-only (encoded via idempotency key `replay:{id}:{n}` until a future additive column is authorised).

## Idempotency

Intent/delivery inserts are unique on `(tenant_id, idempotency_key)` — duplicate insert returns existing row. Try unique on `(delivery_id, attempt_number)`.

## Feature flag

`APZHUB_NOTIFICATION_DURABLE_RUNTIME` default OFF → bootstrap attaches no store; delivery service unchanged.

## Rollback

Disable/keep flag OFF. Repository code unused. No schema DROP.
