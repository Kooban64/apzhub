# EN-004 — Completion Report

> **Story:** EN-004 — In-Process Event Bus  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Date:** 2026-07-03  
> **Status:** Complete — **await review before EN-005**

---

## Objective

Implement the **in-process Event Bus** — publish registered events to in-process subscribers with register-before-publish validation, structured results, subscriber error isolation, envelope validation, and diagnostics. No notifications, persistence, or external delivery.

---

## Acceptance criteria

| Criterion                                         | Status     |
| ------------------------------------------------- | ---------- |
| `InProcessEventBus` implemented                   | ✅         |
| Register-before-publish via `EventRegistry`       | ✅         |
| `subscribe()` / `unsubscribe()` / `publish()`     | ✅         |
| Structured `EventBusPublishResult`                | ✅         |
| Subscriber failure isolation                      | ✅         |
| Event envelope validation                         | ✅         |
| Event bus diagnostics                             | ✅         |
| Dependency injection wired                        | ✅         |
| Event Bus specification                           | ✅         |
| Delivery semantics documentation                  | ✅         |
| No notification / persistence / external delivery | ✅         |
| Owner review before EN-005                        | ⏳ Pending |

---

## Implementation summary

| Component           | Path                                     |
| ------------------- | ---------------------------------------- |
| `InProcessEventBus` | `src/event/in-process-event-bus.ts`      |
| Envelope validation | `src/event/validate-event-envelope.ts`   |
| Pattern matching    | `src/event/match-event-pattern.ts`       |
| Transport stub      | `src/event/event-bus-transport.ts`       |
| Tests               | `src/event/in-process-event-bus.test.ts` |

`EVENT_LAYER_STATUS` updated to `"bus"`.

`createEventNotificationContext()` defaults to `createInProcessEventBus({ registry: eventRegistry })` sharing the registry reference.

`PlaceholderEventBus` retained for test injection only.

---

## Publish validation sequence

1. Envelope shape (UUID v4 ids, ISO-8601 timestamp, plain-object payload)
2. `eventId` registered in `EventRegistry`
3. `eventVersion` matches registration semver exactly
4. `category` matches registration
5. `publisher` authorized (`publisher` or `sourceCapability`)
6. Dispatch to matching subscribers (frozen envelope)

Validation failure returns structured error — **no partial dispatch**.

---

## Delivery semantics

SPR-006 uses **in-process, best-effort delivery**:

- Same-process synchronous dispatch from caller perspective
- No durability, retry, or dead-letter queue
- Subscriber isolation — one handler failure does not block others
- Future options documented: durable queue, outbox, retry, DLQ, webhook bridge via `EventBusTransport`

See [SPR-006-ENF-event-bus-delivery-semantics.md](../specs/SPR-006-ENF-event-bus-delivery-semantics.md).

---

## Architecture compliance

| Rule                                          | Result |
| --------------------------------------------- | ------ |
| Publishes and dispatches only                 | ✅     |
| Produces diagnostics                          | ✅     |
| No notification delivery                      | ✅     |
| No persistence                                | ✅     |
| No external systems                           | ✅     |
| No notification imports in event layer        | ✅     |
| No business logic in bus                      | ✅     |
| No Runtime/Workbench/Action/Knowledge changes | ✅     |

---

## Test results

| Suite                          | Focus                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `in-process-event-bus.test.ts` | Publish, reject unregistered, subscribe/unsubscribe, patterns, isolation, diagnostics, DI |
| Updated package tests          | Exports, status, registry layer status, boundary separation                               |

| Gate                 | Result                                             |
| -------------------- | -------------------------------------------------- |
| `pnpm lint`          | ✅                                                 |
| `pnpm typecheck`     | ✅                                                 |
| `pnpm build`         | ✅                                                 |
| `pnpm test`          | ✅ 936 tests (+14 EN-004)                          |
| `pnpm test:coverage` | ✅ ≥80% (monorepo aggregate **91.19%** statements) |
| `pnpm test:e2e`      | ✅ 24 tests                                        |

---

## Coverage

Event bus subsystem meets package ≥80% thresholds. Monorepo aggregate: **91.19%** statements.

---

## Technical debt

| ID         | Item                                                                                                | Target                         |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| TD-EN04-01 | Async handler failures counted in diagnostics after microtask (not in sync `failedSubscriberCount`) | EN-009 if async mappers needed |
| TD-EN04-02 | `payloadSchema` validation deferred — descriptor has no schema field yet                            | EN-005 / envelope schema story |
| TD-EN04-03 | `EventBusTransport` stub only — no external adapter                                                 | M10                            |
| TD-EN05-01 | Manifest extraction not wired                                                                       | EN-005                         |
| TD-EN05-02 | Platform event catalogue registration                                                               | EN-005                         |
| TD-EN09-01 | Notification mappers not subscribed to bus                                                          | EN-009                         |
| TD-EN14-01 | Action audit hook not wired as publisher                                                            | EN-014                         |

---

## Recommendation for EN-005

Implement **manifest event bootstrap**:

1. `bootstrapEventRegistry()` extracting manifest `events` blocks
2. `PlatformEventCatalogueProvider` for platform catalogue entries
3. Integration with Runtime manifest discovery
4. Wire registry population before server publish paths
5. **Do not** connect Action audit hook until EN-014
6. **Do not** implement notification bootstrap until EN-008+

---

## Next step

**Stop.** Await review before EN-005 (Manifest event bootstrap).

---

_EN-004 In-Process Event Bus — Complete._
