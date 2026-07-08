# SPR-006 — Action Audit Event Specification

> **Story:** EN-014 — Action audit Event Bus wire  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Status:** Implemented  
> **Authority:** [Event Architecture §4.4](./SPR-006-ENF-event-architecture.md) · [Event Envelope](./SPR-006-ENF-event-envelope.md) · ADR [0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## 1. Purpose

Define the **first live platform event** published from the Action Framework: `capability.action.executed`.

Successful action executions produce audit entries. EN-014 converts those entries into registered platform events on the in-process Event Bus. Failed executions are **not** published.

---

## 2. Event identity

| Property        | Value                        |
| --------------- | ---------------------------- |
| `eventId`       | `capability.action.executed` |
| `eventVersion`  | `1.0.0`                      |
| `category`      | `capability`                 |
| `publisher`     | `command-framework`          |
| `sourceService` | `command-framework`          |

Registered in the platform event catalogue (`PLATFORM_EVENT_CATALOGUE`) and bootstrapped via `bootstrapEventRegistry()`.

---

## 3. Publish rules

1. **Success only** — `ActionAuditEntry.ok === true`; failed attempts return `{ skipped: true }` and do not call `EventBus.publish()`.
2. **After execution** — envelope timestamp comes from the audit entry (post-execute).
3. **No persistence** — events are in-process only; no audit store or event archive.
4. **No notifications** — command-framework builds envelopes only; notification mapping is a separate subscriber concern (ENF integration layer).

---

## 4. Envelope fields

| Field           | Source                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------- |
| `envelopeId`    | UUID v4 (generated unless supplied in tests)                                                  |
| `correlationId` | UUID v4 (generated unless supplied)                                                           |
| `causationId`   | Omitted — `auditReference` is carried in payload only (envelope spec requires UUID parent id) |
| `timestamp`     | `ActionAuditEntry.timestamp`                                                                  |
| `actorId`       | `entry.userId ?? entry.actor`                                                                 |

### Payload (`ActionExecutedEventPayload`)

| Field            | Type      | Description                         |
| ---------------- | --------- | ----------------------------------- |
| `actionId`       | `string`  | Executed action id                  |
| `actor`          | `string`  | Actor kind (`user`, `system`, …)    |
| `resultCode`     | `string`  | Action result code (e.g. `SUCCESS`) |
| `ok`             | `boolean` | Always `true` when published        |
| `durationMs`     | `number`  | Execution duration                  |
| `auditReference` | `string`  | Stable audit correlation id         |
| `userId`         | `string?` | Authenticated user when present     |

---

## 5. Implementation surface

### command-framework

| Symbol                                | Path                                         | Role                        |
| ------------------------------------- | -------------------------------------------- | --------------------------- |
| `CAPABILITY_ACTION_EXECUTED_EVENT_ID` | `src/audit/action-executed-event.ts`         | Canonical event id constant |
| `buildActionExecutedEventEnvelope()`  | `src/audit/action-executed-event.ts`         | Envelope builder            |
| `publishActionExecutedEvent()`        | `src/audit/publish-action-executed-event.ts` | Generic publisher port      |

### event-notification-framework

| Symbol                              | Path                                              | Role                      |
| ----------------------------------- | ------------------------------------------------- | ------------------------- |
| `publishActionExecutedEventToBus()` | `src/integration/action-audit-event-publisher.ts` | Publishes to `EventBus`   |
| `createActionAuditEventBusHook()`   | `src/integration/action-audit-event-publisher.ts` | `ActionAuditHook` adapter |

---

## 6. Wiring pattern

```text
ActionExecutor.execute()
        ↓
ActionAuditHook.record(entry)
        ↓
createActionAuditEventBusHook({ eventBus })
        ↓
publishActionExecutedEventToBus(eventBus, entry)
        ↓
InProcessEventBus.publish(envelope)
        ↓
subscribers (notifications, diagnostics, …)
```

Application bootstrap wires the audit hook in EN-015. EN-014 provides the adapter and tests only.

---

## 7. Out of scope (EN-014)

- `capability.action.failed` event (catalogue entry may exist as `planned`; not published)
- Persistent audit / activity stores
- Toast or external notification delivery
- Client-side Event Bus API

---

## 8. Tests

| Test file                                                                                 | Coverage                                        |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `command-framework/src/audit/action-executed-event.test.ts`                               | Envelope builder, skip-on-failure, publish port |
| `event-notification-framework/src/integration/action-audit-event-publisher.test.ts`       | Bus publish, audit hook                         |
| `event-notification-framework/src/integration/action-audit-notification-pipeline.test.ts` | Full path with test-only mapper wiring          |

---

_EN-014 Action audit event — specification complete._
