# APZQEP-120-S08 — Engineering Notes

| Field           | Value                                             |
| --------------- | ------------------------------------------------- |
| Programme       | APZQEP-120                                        |
| Slice           | S08                                               |
| Title           | Reliable Event Delivery (Outbox Drain)            |
| Status          | **COMPLETE**                                      |
| Timestamp (UTC) | 20260802T141518Z                                  |
| Baseline        | Governance 1.0 · EE Baseline 1.2 · Framework v1.0 |

## Objective

Implement reliable persistence and delivery of S07 domain events. Transport-neutral. Enterprise-capable outbox engine in `@apzhub/platform-outbox`.

## Implemented

| Capability                  | Location                                             |
| --------------------------- | ---------------------------------------------------- |
| Outbox domain model         | `packages/platform-outbox/src/types.ts`              |
| Outbox repository / store   | `store/port.ts`, `memory.ts`, `postgres-platform.ts` |
| State model                 | `delivery/states.ts`                                 |
| Delivery service/dispatcher | `delivery/dispatcher.ts`, `worker.ts`                |
| Retry policy                | `retry-policy.ts`                                    |
| Delivery metadata / audit   | `DeliveryAttemptRecord`, `delivery/observability.ts` |
| Idempotency                 | enqueue by id + `deliveryIdempotencyKey`             |
| Locking / scheduling        | `claimBatch` + `nextAttemptAt`                       |
| Dead-letter prep hooks      | `onDeadLetterReady`                                  |
| Observability hooks         | `DeliveryObservabilityHooks` (metrics only)          |
| Null transport              | `delivery/transport.ts`                              |
| Evidence publisher wiring   | `qep-evidence/.../outbox-publisher.ts`               |
| Persistence migration       | `0093` / `0094` `platform_outbox_event`              |

## Out of scope (respected)

Workers product · Notifications · Search · UCP · QI · AI · Dashboards · Kafka/Rabbit/NATS/external buses · cross-service delivery product.

## Tests

- `@apzhub/platform-outbox` — 12/12
- `@apzhub/qep-evidence` — 131/131 (includes outbox delivery, crash recovery, FIFO, migration)

## Consumed (not redesigned)

S07 Event Catalogue · ES-001 · ES-002 · ES-003 · Governance artefacts unchanged.
