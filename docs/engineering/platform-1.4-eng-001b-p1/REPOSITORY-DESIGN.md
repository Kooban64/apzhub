# Repository Design — ENG-001B-P1

## Package

`@apzhub/notification-delivery-persistence` **0.1.0**

## Port

`NotificationDeliveryDurableStorePort` (`@apzhub/notification-contracts` **0.3.2**)

Supports: intent/delivery/try/in-app CRUD · lease field persistence · retry field persistence · dead-letter field persistence · replay insert (new delivery row).

Does **not** implement: `FOR UPDATE SKIP LOCKED` claim acquisition, worker loops, dispatch.

## Implementations

| Kind                 | Factory                                                                | Use            |
| -------------------- | ---------------------------------------------------------------------- | -------------- |
| `postgresql_durable` | `createPostgresNotificationDeliveryDurableStore` / `createProduction…` | Production SoR |
| `memory_durable`     | `createInMemoryNotificationDeliveryDurableStore`                       | Tests only     |

## Classes / modules

- `src/mappers.ts` — row ↔ domain
- `src/postgres/store.ts` — Postgres repository
- `src/in-memory/store.ts` — in-memory repository
- `src/factories.ts` — mode-aware factories

## DI (platform-services)

- `createDurableDeliveryStoreFromDb(db)`
- `createDurableDeliveryStoreForTest()`
- `createDurableNotificationRuntimeBootstrap` — flag OFF forces `store: null`; mode always `process_local` in P1
