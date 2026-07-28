# Current-State Assessment — Notification Delivery Runtime

## Verified (repository evidence)

| Topic                         | Finding                                                                                                                        | Evidence                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Ownership                     | Notification Delivery Platform Service owns intent/delivery/attempts                                                           | ADR-0071 · ENG-004 · `create-notification-delivery-service.ts` |
| Intent creation               | Command intake + Event Bus subscribe for authorised event types                                                                | Service `createIntent` / `ingestDomainEvent`                   |
| Persistence (schema)          | Additive Postgres tables for intent, delivery, try, in-app item                                                                | Migration **0065**                                             |
| Persistence (runtime Phase A) | **Process-local** `Map` stores for intents, deliveries, tries, in-app, idempotency indexes                                     | Service lines creating `new Map(...)`                          |
| Worker                        | In-process `setInterval` calling `processQueue`                                                                                | Service workerTimer                                            |
| Queue selection               | In-memory filter: status `queued`/`retry_scheduled` and `next_attempt_at` due                                                  | `processQueue`                                                 |
| State transitions             | Contract lifecycle with `assertNotificationDeliveryTransition`                                                                 | `@apzhub/notification-contracts` lifecycle                     |
| Delivery statuses             | `requested`, `queued`, `processing`, `delivered`, `retry_scheduled`, `permanent_failure`, `cancelled`, `expired`, `suppressed` | contracts lifecycle                                            |
| Dead letter                   | `deadLetter` boolean on delivery record; permanent failure path                                                                | contracts + service                                            |
| Idempotency                   | Intent key `tenantId:idempotencyKey`; delivery key per channel/user                                                            | service Maps + 0065 unique indexes                             |
| Retries                       | Exponential backoff helper; max attempts from env                                                                              | `backoffMs` · `notificationMaxAttempts`                        |
| Event Bus                     | Fail-soft publish of delivery events; subscribe for intake                                                                     | service publish + attachEventBus                               |
| Outbox                        | Not used as work-claim coordinator in Phase A                                                                                  | No outbox claim code in delivery service                       |
| Provider                      | In-app adapter certified; SMTP deferred                                                                                        | ENG-004 · ADR-0071                                             |
| Flags                         | Deny-by-default env flags for delivery/worker/command/event/in-app                                                             | `delivery-env.ts`                                              |
| Admin                         | Diagnostics/health/metrics/readiness APIs; dead-letter replay path in service                                                  | service methods + ENG-004 docs                                 |
| Limitation                    | **P13-KL-ND-03** schema ready; runtime Phase A process-local                                                                   | ENG-004 KNOWN-LIMITATIONS                                      |

## Assumptions (not verified as production-wired)

| Assumption                                                                    | Notes                                                                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Production bootstrap does not yet bind 0065 repositories for delivery runtime | Supported by KL-ND-03 wording; no conflicting Postgres repository wiring found in delivery service factory |
| Multi-instance workers would duplicate or lose work today                     | Inferred from process-local Maps + single-process interval; not load-tested under CERT-002                 |

## ADR-0071 gap

ADR-0071 **already required** PostgreSQL persistence for Intent/Delivery/Attempt. Phase A implemented behaviour and schema, but **runtime authoritative state remains process-local** — the durability gap ADR-0073 closes.
