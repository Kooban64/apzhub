# SPR-006 — Event-to-Notification Mapping

> **Story:** EN-001 · EN-009 (implementation)  
> **Status:** Specification — **implemented in EN-009**  
> **Authority:** [ADR-0032](../adr/ADR-0032-notification-routing-model.md) · [Notification Architecture](./SPR-006-ENF-notification-architecture.md)

---

## Purpose

Define how **EventToNotificationMapper** converts Event Bus dispatches into **NotificationItem** instances.

---

## Architectural rule

```text
Event Bus dispatch
        ↓
EventToNotificationMapper (subscriber)
        ↓
NotificationItem → NotificationSessionStore
        ↓
NotificationService → Experiences
```

The mapper **never** calls `EventBus.publish()`. Notifications do not generate events.

---

## Mapping pipeline

```text
1. Receive PlatformEventEnvelope from bus
2. Match active NotificationRoutes by eventPattern
3. For each matching route:
   a. Evaluate permission (server)
   b. Apply priority / attention rules (scaffold)
   c. Render title/body from template + payload
   d. Create NotificationItem
   e. Write to NotificationSessionStore
4. Notify NotificationService subscribers (in-process)
```

---

## Pattern matching

| eventPattern                        | Matches                 |
| ----------------------------------- | ----------------------- |
| `capability.action.executed`        | Exact eventId only      |
| `capability.action.*`               | Prefix pattern (EN-009) |
| `integration.connector.sync.failed` | Exact                   |

Prefix patterns require ADR-0032 compliance — no arbitrary regex in SPR-006.

---

## Fan-out example

Single event, multiple routes:

```text
Envelope: capability.action.executed
        │
        ├── route: platform.action.executed.inbox
        │     → NotificationItem (kind: inbox, channel: in-app)
        │
        └── route: platform.action.executed.toast
              → NotificationItem (kind: toast, channel: in-app)
```

Same event, different **notification kinds** — not different event types.

---

## Action reference delegation

When route template includes actionable notification:

```yaml
actionRef:
  actionId: platform.notifications.view-audit
  handlerContext:
    envelopeId: "{{envelopeId}}"
```

Experience calls `useCommandRegistry().execute()` or `useNotificationService` action helper — **no new execution pipeline**.

---

## Idempotency

Duplicate envelope delivery (future persistent bus) must not duplicate NotificationItems with same `sourceEnvelopeId` + `routeId`.

---

## Deferred mappers

| Mapper              | Event                        | Target        | Sprint |
| ------------------- | ---------------------------- | ------------- | ------ |
| ActionAuditMapper   | `capability.action.executed` | inbox + toast | EN-009 |
| DigestBatchMapper   | multiple                     | email digest  | M8+    |
| AttentionSuppressor | all                          | quiet hours   | M8+    |

---

## Error handling

| Failure                  | Behaviour                                   |
| ------------------------ | ------------------------------------------- |
| Template render error    | Log; skip route; continue others            |
| Store write error        | Log; return error to bus subscriber wrapper |
| Unknown route at runtime | Should not occur — bootstrap registers all  |

---

_SPR-006 Event-to-Notification Mapping — EN-001._
