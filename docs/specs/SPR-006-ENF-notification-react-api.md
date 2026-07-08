# SPR-006 — Notification React API

> **Story:** EN-010, EN-011, EN-012  
> **Status:** Implemented  
> **Package subpath:** `@apzhub/event-notification-framework/react`

---

## Status

`EVENT_NOTIFICATION_REACT_STATUS = "presentation"`

---

## Provider

```tsx
import {
  NotificationRegistryProvider,
  sampleNotificationRegistryDto,
} from "@apzhub/event-notification-framework/react";

<NotificationRegistryProvider dto={filteredDto}>
  {children}
</NotificationRegistryProvider>;
```

The `dto` prop must be the **permission-filtered** server snapshot.

---

## Hooks

### `useNotificationRegistry()`

Returns:

| Field              | Type                                    | Description         |
| ------------------ | --------------------------------------- | ------------------- |
| `isReady`          | `boolean`                               | Hydration succeeded |
| `routes`           | `ClientNotificationRoute[]`             | Sorted route list   |
| `has(routeId)`     | function                                | Route lookup        |
| `get(routeId)`     | function                                | Route retrieval     |
| `list()`           | function                                | Same as `routes`    |
| `schemaVersion`    | `1`                                     | DTO schema version  |
| `frameworkVersion` | `string?`                               | Platform version    |
| `diagnostics`      | `ClientNotificationRegistryDiagnostics` | Client diagnostics  |
| `importErrors`     | `NotificationRegistrationIssue[]`       | Validation errors   |

Throws outside `NotificationRegistryProvider`.

### `NotificationServiceProvider`

```tsx
import {
  NotificationServiceProvider,
  useNotificationService,
} from "@apzhub/event-notification-framework/react";

<NotificationServiceProvider service={optionalService}>
  {children}
</NotificationServiceProvider>;
```

Defaults to `createDefaultNotificationService()` when `service` is omitted.

### `useNotificationService()`

Returns:

| Field                     | Type                             | Description                       |
| ------------------------- | -------------------------------- | --------------------------------- |
| `service`                 | `NotificationService`            | Underlying service instance       |
| `notifications`           | `NotificationItem[]`             | Session store list (newest first) |
| `unreadCount`             | `number`                         | Unread count                      |
| `diagnostics`             | `NotificationServiceDiagnostics` | Service diagnostics               |
| `addNotifications(items)` | function                         | Ingest mapper output              |
| `getNotification(id)`     | function                         | Single lookup                     |
| `markAsRead(id)`          | function                         | Mark one read                     |
| `markAllAsRead()`         | function                         | Mark all read                     |
| `clearNotifications()`    | function                         | Clear session store               |

Subscribes via `useSyncExternalStore` + `getStoreRevision()`.

Throws outside `NotificationServiceProvider`.

### `useNotificationPresentation()`

Returns mapped view models, priority groups, and presentation diagnostics from the service state.

| Field                    | Type                                  | Description                            |
| ------------------------ | ------------------------------------- | -------------------------------------- |
| `viewModels`             | `NotificationViewModel[]`             | UI-ready models                        |
| `groups`                 | `NotificationPriorityGroup[]`         | Priority buckets                       |
| `diagnostics`            | `NotificationPresentationDiagnostics` | Presentation metrics                   |
| `serviceDiagnostics`     | `NotificationServiceDiagnostics`      | Underlying service metrics             |
| `unreadCount`            | `number`                              | From service                           |
| Service mutation methods | functions                             | `addNotifications`, `markAsRead`, etc. |

Requires `NotificationServiceProvider`. Does not mutate service state except via delegated service methods.

Presentation helpers are also exported for non-React use: `mapNotificationItemToViewModel`, `presentNotificationsFromItems`.

### `useNotificationRegistryContext()`

Lower-level context access — same value as provider context.

---

## Client hydration (non-React)

```typescript
import { createNotificationRegistryFromDto } from "@apzhub/event-notification-framework/react";

const { ok, registry, diagnostics, errors } = createNotificationRegistryFromDto(dto);
```

---

## Server helpers (re-exported)

| Export                                          | Purpose                  |
| ----------------------------------------------- | ------------------------ |
| `mapNotificationRegistryDto`                    | Server registry → DTO    |
| `filterNotificationRegistryDto`                 | Permission filter        |
| `validateNotificationRegistryDto`               | DTO validation           |
| `buildNotificationRegistryHydrationDiagnostics` | Server hydration metrics |

---

## Placeholders (future stories)

| API                  | Story                             |
| -------------------- | --------------------------------- |
| `useEventRegistry()` | Event client hydration (deferred) |

---

## Architectural rules

| Rule                                | EN-010 / EN-011 |
| ----------------------------------- | --------------- |
| Read-only client registry           | ✅              |
| No client registration              | ✅              |
| No mapper execution on client       | ✅              |
| Session service read/query only     | ✅              |
| No notification delivery / shell UI | ✅              |

---

_SPR-006 Notification React API — EN-010, EN-011, EN-012._
