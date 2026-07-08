# SPR-006 — Event-to-Notification Integration Notes

> **Story:** EN-014 — Action audit Event Bus wire  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Status:** Test wiring documented — production bootstrap deferred to EN-015  
> **Authority:** [Event-to-notification mapping](./SPR-006-ENF-event-to-notification-mapping.md) · ADR [0032](../adr/ADR-0032-notification-routing-model.md)

---

## 1. Purpose

Document how **platform events** flow into **in-app notifications** without collapsing the Event and Notification layers.

EN-014 validates the pipeline in integration tests. Production application wiring is EN-015 scope.

---

## 2. Layer separation

| Layer                | Responsibility                                | Must not                            |
| -------------------- | --------------------------------------------- | ----------------------------------- |
| Event Bus            | Dispatch registered envelopes to subscribers  | Create `NotificationItem` instances |
| Notification Mapper  | Map envelopes → notification items via routes | Call `EventBus.publish()`           |
| Notification Service | Session-scoped store and read APIs            | Subscribe to Event Bus directly     |

Action Framework publishes events only. It does not call mappers or the Notification Service.

---

## 3. Full path (reference)

```text
ActionExecutor.execute()  [command-framework]
        ↓
ActionAuditHook.record()  [ENF adapter]
        ↓
EventBus.publish(capability.action.executed)
        ↓
EventBus subscriber handler
        ↓
NotificationMapper.map(envelope)
        ↓
NotificationService.addNotifications(items)
        ↓
Presentation + shell Experiences (EN-012, EN-013)
```

---

## 4. Test-only wiring (EN-014)

`wireNotificationMapperToService(context)` registers an Event Bus subscriber:

- **Pattern:** `capability.action.*`
- **Handler:** `notificationMapper.map(envelope)` → `notificationService.addNotifications(items)` when mapping succeeds

This function is exported for integration tests and **must not** be used as production bootstrap. EN-015 will compose equivalent wiring in the application composition root with explicit lifecycle and diagnostics.

---

## 5. Notification routes for action executed

Integration tests register routes (mirroring EN-009 mapper tests):

| routeId                            | eventPattern                 | kind    |
| ---------------------------------- | ---------------------------- | ------- |
| `capability.action.executed.inbox` | `capability.action.executed` | `inbox` |
| `capability.action.executed.toast` | `capability.action.executed` | `toast` |

Platform catalogue routes may be bootstrapped separately via `bootstrapNotificationRegistry()`. Mapper registry sync uses `syncNotificationMapperRegistryFromDescriptors()`.

---

## 6. Failure behaviour

| Scenario              | Event published     | Notification stored                             |
| --------------------- | ------------------- | ----------------------------------------------- |
| Action succeeds       | Yes                 | Yes (when routes registered + subscriber wired) |
| Action fails          | No                  | No                                              |
| Unregistered event id | Bus rejects publish | No                                              |
| No matching routes    | Event published     | Mapper returns zero items                       |

---

## 7. EN-015 production integration checklist

1. Create shared `EventNotificationContext` in `apps/web` hydration module
2. Bootstrap event and notification registries
3. Pass `createActionAuditEventBusHook({ eventBus })` to Action executor factory
4. Register production Event Bus subscriber(s) for notification mapping (not test helper)
5. Mount `NotificationServiceProvider` + shell experience flags (EN-013)
6. Extend health diagnostics with event/notification summaries

---

## 8. Architectural compliance

| Rule                                          | EN-014 |
| --------------------------------------------- | ------ |
| Events ≠ notifications                        | ✅     |
| No toast delivery                             | ✅     |
| No external channels                          | ✅     |
| No event persistence                          | ✅     |
| No Notification Service from Action Framework | ✅     |

---

_EN-014 event-to-notification integration notes — complete._
