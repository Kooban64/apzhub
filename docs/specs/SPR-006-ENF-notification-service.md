# SPR-006 — Notification Service

> **Story:** EN-011  
> **Status:** Implemented  
> **Authority:** [Notification Architecture](./SPR-006-ENF-notification-architecture.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define the **Notification Service** — the stable public API between Notification Mappers and Notification Experiences. Stores immutable `NotificationItem` instances in a session-scoped in-memory store. Exposes read/query APIs and tracks read state.

**Does not:** publish events, execute mappers, deliver notifications, render UI, or persist notifications.

---

## Lifecycle

```text
Mapped NotificationItem (from DefaultNotificationMapper)
        ↓
NotificationService.addNotifications()
        ↓
NotificationSessionStore (in-memory, session-scoped)
        ↓
Read APIs (list, get, unread count, mark read, clear)
        ↓
Future Notification Experiences (EN-012+)
```

No delivery. No persistence. No Event Bus publish.

---

## Components

| Component                         | Path                                                     | Role                   |
| --------------------------------- | -------------------------------------------------------- | ---------------------- |
| `NotificationService`             | `src/notification/notification-service.ts`               | Public interface       |
| `DefaultNotificationService`      | `src/notification/default-notification-service.ts`       | Default implementation |
| `NotificationSessionStore`        | `src/notification/notification-session-store.ts`         | Store interface        |
| `DefaultNotificationSessionStore` | `src/notification/default-notification-session-store.ts` | In-memory store        |
| `NotificationServiceProvider`     | `src/react/notification-service-context.tsx`             | React DI               |
| `useNotificationService`          | `src/react/use-notification-service.ts`                  | React hook             |

---

## Public API

| Method                        | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| `addNotifications(items)`     | Append mapper output; deduplicates by `notificationId`                 |
| `listNotifications(options?)` | Ordered list with optional `unreadOnly`, `kind`, `limit`               |
| `getNotification(id)`         | Lookup single item with current read state                             |
| `getUnreadCount()`            | Unread count                                                           |
| `markAsRead(id)`              | Mark one notification read; returns `false` if missing or already read |
| `markAllAsRead()`             | Mark all unread read; returns count updated                            |
| `clearNotifications()`        | Clear session store; returns count cleared                             |
| `markRead` / `markAllRead`    | Aliases for backward compatibility                                     |
| `subscribe(listener)`         | Mutation subscription for React `useSyncExternalStore`                 |
| `getDiagnostics()`            | Service health and counts                                              |

---

## Ordering

`listNotifications()` returns items sorted by:

1. `timestamp` descending (newest first)
2. `notificationId` ascending (stable tie-break)

---

## Idempotency

`notificationId` is `{envelopeId}:{routeId}`. Duplicate `addNotifications` calls skip existing ids (`skippedCount`).

---

## Diagnostics

| Field                       | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `activeNotificationCount`   | Total stored notifications                         |
| `unreadCount`               | Unread notifications                               |
| `readCount`                 | Read notifications                                 |
| `lastNotificationTimestamp` | Latest item timestamp                              |
| `status`                    | `empty` or `ready`                                 |
| `health`                    | `empty` when no items; `healthy` when store active |
| `layerStatus`               | `NOTIFICATION_LAYER_STATUS` (`"service"`)          |

---

## Dependency injection

`createEventNotificationContext()` defaults to `createDefaultNotificationService()`.

```typescript
import { createEventNotificationContext } from "@apzhub/event-notification-framework";

const context = createEventNotificationContext();
const mapped = context.notificationMapper.map(envelope);
context.notificationService.addNotifications(mapped.items);
```

Custom store injection:

```typescript
createDefaultNotificationService({ store: customStore });
```

---

## React

```typescript
import {
  NotificationServiceProvider,
  useNotificationService,
} from "@apzhub/event-notification-framework/react";

<NotificationServiceProvider>
  <App />
</NotificationServiceProvider>
```

`EVENT_NOTIFICATION_REACT_STATUS = "service"`.

---

## Boundary rules

| Allowed                        | Forbidden                        |
| ------------------------------ | -------------------------------- |
| Store `NotificationItem`       | Publish to Event Bus             |
| Read/query APIs                | Execute notification mappers     |
| Track read state               | Deliver notifications            |
| Session-scoped in-memory store | Render UI                        |
| Subscribe for UI sync          | Persist to DB or browser storage |

---

## Related specs

- [Notification Session Store](./SPR-006-ENF-notification-session-store.md)
- [Notification Item](./SPR-006-ENF-notification-item.md)
- [Event-to-Notification Mapper](./SPR-006-ENF-notification-mapper.md)
