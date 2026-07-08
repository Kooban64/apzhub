# SPR-006 — Application Integration Specification

> **Story:** EN-015 — Application integration (`apps/web`)  
> **Sprint:** SPR-006 — Event & Notification Framework  
> **Status:** Implemented  
> **Authority:** [Event-to-notification integration](./SPR-006-ENF-event-to-notification-integration.md) · EN-014 action audit spec

---

## 1. Purpose

Wire the Event & Notification Framework into the **production application bootstrap** (`apps/web`) using existing framework implementations only. No new framework capabilities, external delivery, or persistence.

---

## 2. Composition modules

| Module                  | Path                                                     | Role                                                |
| ----------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| Shared context factory  | `apps/web/lib/create-app-event-notification-context.ts`  | Bootstrap registries, app routes, mapper subscriber |
| Runtime loader          | `apps/web/lib/load-shared-event-notification-context.ts` | Server/runtime-backed context                       |
| Layout hydration        | `apps/web/lib/event-notification-hydration.ts`           | Permission-filtered DTOs for layout                 |
| Health summaries        | `apps/web/lib/event-notification-health.ts`              | `/api/health` event + notification fields           |
| App notification routes | `apps/web/lib/register-app-notification-routes.ts`       | `capability.action.executed` inbox/toast routes     |
| Production subscriber   | `apps/web/lib/wire-app-event-notifications.ts`           | Event Bus → mapper → Notification Service           |
| Client context hook     | `apps/web/lib/use-app-event-notification-context.ts`     | Session context for React shell                     |
| Action executor         | `apps/web/lib/create-app-action-executor.ts`             | Accepts `auditHook` from shared context             |

---

## 3. Bootstrap sequence

```text
Runtime.bootstrap()
        ↓
loadSharedEventNotificationContext()
        ↓
createAppEventNotificationContext({ capabilityRecords })
        ├─ bootstrapNotificationRegistry()
        ├─ registerAppNotificationRoutes()
        ├─ createEventNotificationContext({ notificationRegistry })
        ├─ bootstrapEventRegistry()
        └─ wireAppEventNotifications()
        ↓
loadEventNotificationHydration() — permission-filtered DTOs
        ↓
ActionWorkbenchShellProvider
        ├─ NotificationRegistryProvider
        ├─ NotificationServiceProvider (shared service instance)
        ├─ WorkbenchProvider + audit hook on executor
        └─ DesktopShell notification experiences
```

---

## 4. Action integration

Production `createAppActionExecutorBundle()` receives:

```typescript
createActionAuditEventBusHook({ eventBus: context.eventBus });
```

EN-014 test helper `wireNotificationMapperToService()` remains **test-only** in `@apzhub/event-notification-framework`. Production uses `wireAppEventNotifications()` in `apps/web`.

---

## 5. React providers

| Provider                       | Source                                                    |
| ------------------------------ | --------------------------------------------------------- |
| `NotificationRegistryProvider` | Server `notificationDto` from hydration                   |
| `NotificationServiceProvider`  | `context.notificationService` from client session context |

Services are not duplicated — one `EventNotificationContext` per client shell session.

---

## 6. Shell integration

`WorkbenchPage` enables:

- `enableNotificationBadge`
- `enableNotificationPanel`

Requires `NotificationServiceProvider` + `CommandRegistryProvider` ancestors (provided by `ActionWorkbenchShellProvider`).

---

## 7. Out of scope

- Email, SMS, push, webhooks
- Event/notification persistence
- Background workers, queues, retry logic
- Toast redesign

---

_EN-015 application integration specification — complete._
