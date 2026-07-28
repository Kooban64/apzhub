# Implementation Summary — Platform-1.4-ENG-001B-P0

## Delivered

1. **Migration 0066** — additive lease/attempt columns + indexes (`0066_apz_platform_notification_delivery_leases.sql`)
2. **Journal reconciliation** — registered missing **0065** + new **0066** in `drizzle/meta/_journal.json`
3. **Drizzle entities** — `platform-notification-delivery-schema.ts` recognises new columns/indexes
4. **Contracts 0.3.1** — optional lease fields, durable mode type, `NotificationDeliveryDurableStorePort`
5. **Feature flag** — `APZHUB_NOTIFICATION_DURABLE_RUNTIME` (default OFF)
6. **Bootstrap** — `createDurableNotificationRuntimeBootstrap` always returns `process_local` + `store: null` in Phase 0

## Not delivered (by design)

No changes to `createNotificationDeliveryService` runtime Maps/worker. No claiming, retries, DLQ, replay, providers, SMTP.

## Packages touched

| Package                          | Change                                 |
| -------------------------------- | -------------------------------------- |
| `@apzhub/config`                 | Migration 0066 + schema + journal      |
| `@apzhub/notification-contracts` | **0.3.0 → 0.3.1** additive types/port  |
| `@apzhub/platform-services`      | Flag + bootstrap + unit tests; exports |
| Root env examples                | Document flag (commented)              |
