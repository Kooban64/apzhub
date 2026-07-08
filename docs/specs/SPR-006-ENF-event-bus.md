# SPR-006 — In-Process Event Bus

> **Story:** EN-004  
> **Status:** Implemented  
> **Authority:** [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md) · [Event envelope](./SPR-006-ENF-event-envelope.md)

---

## Purpose

Define the **InProcessEventBus** — in-process publish/subscribe dispatch for registered platform events. The bus validates envelopes against the Event Registry, dispatches to subscribers, and produces diagnostics. It does **not** create notifications, persist events, or call external systems.

---

## Components

| Component               | Path                                   | Role                          |
| ----------------------- | -------------------------------------- | ----------------------------- |
| `InProcessEventBus`     | `src/event/in-process-event-bus.ts`    | Publish, subscribe, dispatch  |
| `validateEventEnvelope` | `src/event/validate-event-envelope.ts` | Pre-dispatch validation       |
| `matchesEventPattern`   | `src/event/match-event-pattern.ts`     | Subscription pattern matching |
| `EventBusTransport`     | `src/event/event-bus-transport.ts`     | Future external adapter stub  |

---

## EventBus contract

```typescript
interface EventBus {
  publish(envelope: EventEnvelope): EventBusPublishResult;
  subscribe(options: EventBusSubscribeOptions): string;
  unsubscribe(subscriptionId: string): boolean;
  getDiagnostics(): EventBusDiagnostics;
}
```

### Publish result

```typescript
interface EventBusPublishResult {
  readonly ok: boolean;
  readonly envelopeId?: string;
  readonly errorCode?:
    "EVENT_NOT_REGISTERED" | "INVALID_ENVELOPE" | "PUBLISH_FAILED" | "NOT_IMPLEMENTED";
  readonly errorMessage?: string;
  readonly subscriberCount?: number;
  readonly deliveredCount?: number;
  readonly failedSubscriberCount?: number;
}
```

Validation failure returns structured error — **no partial dispatch**.

---

## Register-before-publish

Every `publish()` validates:

1. `eventId` registered in `EventRegistry`
2. `eventVersion` matches registration semver exactly
3. `category` matches registration
4. `publisher` matches registration `publisher` or `sourceCapability`
5. Envelope shape (UUID v4 ids, ISO-8601 timestamp, plain-object payload)

Unregistered or invalid envelopes fail with `EVENT_NOT_REGISTERED` or `INVALID_ENVELOPE`.

---

## Subscribe / unsubscribe

```typescript
interface EventBusSubscribeOptions {
  readonly eventPattern: string;
  readonly handler: (envelope: EventEnvelope) => void | Promise<void>;
}
```

| Pattern form | Example                      | Matches                                                   |
| ------------ | ---------------------------- | --------------------------------------------------------- |
| Exact id     | `capability.action.executed` | That event id only                                        |
| Prefix       | `capability.action.*`        | `capability.action` and `capability.action.*` descendants |

`subscribe()` returns a `subscriptionId` (UUID). `unsubscribe(subscriptionId)` removes the handler; returns `false` if id unknown.

---

## Subscriber isolation

Subscriber exceptions are caught per handler. One failure does not block other subscribers. Failures increment `failedSubscriberCount` (sync) and `subscriberFailureCount` in diagnostics.

Envelopes passed to handlers are **frozen** — subscribers must not mutate envelope or payload.

---

## Diagnostics

`EventBusDiagnostics` exposes:

| Field                    | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `status`                 | `empty` · `ready` · `scaffold` (placeholder only) |
| `subscriptionCount`      | Active subscriptions                              |
| `publishCount`           | Successful publishes                              |
| `failedPublishCount`     | Validation failures                               |
| `subscriberFailureCount` | Handler failures (cumulative)                     |
| `lastPublishStatus`      | `none` · `success` · `failed`                     |
| `lastPublishEnvelopeId`  | Last attempted envelope id                        |

---

## Dependency injection

`createEventNotificationContext()` defaults to:

```typescript
const eventRegistry = createDefaultEventRegistry();
const eventBus = createInProcessEventBus({ registry: eventRegistry });
```

The bus shares the registry reference for register-before-publish validation.

`PlaceholderEventBus` remains available for test injection only.

---

## Boundaries (must not)

| Rule                        | EN-004 |
| --------------------------- | ------ |
| Deliver notifications       | ❌     |
| Persist events              | ❌     |
| External broker / webhook   | ❌     |
| Import notification modules | ❌     |
| Execute business logic      | ❌     |

Notification mappers subscribe in EN-009+.

---

## Related

- [Delivery semantics](./SPR-006-ENF-event-bus-delivery-semantics.md)
- [Event envelope](./SPR-006-ENF-event-envelope.md)
- [Event registry](./SPR-006-ENF-event-registry.md)

---

_SPR-006 In-Process Event Bus — EN-004._
