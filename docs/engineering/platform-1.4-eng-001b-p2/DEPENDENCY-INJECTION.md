# Dependency Injection — Platform-1.4-ENG-001B-P2

## Feature flag

| Flag                                  | Default | Effect                                                                                                                                       |
| ------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `APZHUB_NOTIFICATION_DURABLE_RUNTIME` | **OFF** | OFF → no durable store/worker in bootstrap; process-local runtime sole active path. ON → may attach durable store + durable worker skeleton. |

Additional gates for durable worker start/create:

- `APZHUB_NOTIFICATION_DELIVERY_ENABLED`
- `APZHUB_NOTIFICATION_WORKER_ENABLED`

## Bootstrap

`createDurableNotificationRuntimeBootstrap`:

| Flag                     | `store`                      | `durableWorker`                                     | `mode`          |
| ------------------------ | ---------------------------- | --------------------------------------------------- | --------------- |
| OFF                      | `null`                       | `null`                                              | `process_local` |
| ON (delivery/worker OFF) | attached (or memory default) | `null`                                              | `process_local` |
| ON (delivery+worker ON)  | attached                     | created (not auto-started unless `autoStartWorker`) | `process_local` |

**Important:** `mode` remains `process_local` in P2 — Maps in `createNotificationDeliveryService` are not replaced. Cut-over is P3+.

## Exports

- `@apzhub/platform-services`: `createDurableNotificationWorker`, `createDurableNotificationWorkerIfEnabled`, bootstrap helpers
- `@apzhub/notification-delivery-persistence` **0.2.0**: claim/lease on durable stores

## Compatibility

Existing process-local worker **not removed**. Runtime selection **only** via durable flag. Default remains OFF.
