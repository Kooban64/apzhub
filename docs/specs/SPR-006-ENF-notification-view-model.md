# SPR-006 — Notification View Model

> **Story:** EN-012  
> **Status:** Implemented  
> **Authority:** [Notification Presentation Layer](./SPR-006-ENF-notification-presentation-layer.md)

---

## Purpose

Document the **`NotificationViewModel`** — the UI-ready projection of a service `NotificationItem` for Experiences.

View models are **immutable**, **derived**, and **session-local**. They are recreated whenever service state changes.

---

## Interface

```typescript
interface NotificationViewModel {
  notificationId: string;
  routeId: string;
  eventId: string;
  title: string;
  body?: string;
  kind: NotificationKind;
  channel: DeliveryChannel;
  priority: NotificationPriority;
  severity: NotificationPresentationSeverity;
  timestamp: string; // ISO — canonical
  relativeTimestamp: string; // formatted for lists
  readState: "read" | "unread";
  isUnread: boolean;
  actionRef?: NotificationActionRef;
  category: EventCategory;
  correlationId: string;
}
```

Path: `src/presentation/notification-view-model.ts`

---

## Severity

Presentation severity is derived from priority — not stored on `NotificationItem`:

| `priority` | `severity` |
| ---------- | ---------- |
| `urgent`   | `critical` |
| `high`     | `warning`  |
| `normal`   | `info`     |
| `low`      | `subtle`   |

Helper: `mapNotificationPriorityToSeverity()`.

---

## Read state

| Service `metadata.read` | `readState` | `isUnread` |
| ----------------------- | ----------- | ---------- |
| `false`                 | `unread`    | `true`     |
| `true`                  | `read`      | `false`    |

Presentation reflects service state only. Experiences call `markAsRead()` on the service — not on view models.

---

## Action reference passthrough

When `NotificationItem.metadata.actionRef` is present, it is copied unchanged onto the view model.

Experiences delegate execution to the Action Framework:

```typescript
if (viewModel.actionRef) {
  execute(viewModel.actionRef.actionId, viewModel.actionRef.handlerContext);
}
```

Presentation layer does **not** invoke `execute()`.

---

## Priority groups

```typescript
interface NotificationPriorityGroup {
  key: NotificationPriority;
  label: string; // e.g. "High priority"
  priority: NotificationPriority;
  severity: NotificationPresentationSeverity;
  items: readonly NotificationViewModel[];
  unreadCount: number;
}
```

Used by inbox/panel Experiences (EN-013) for section headers and badge counts per bucket.

---

## Mapping helpers

| Function                                | Input                | Output                             |
| --------------------------------------- | -------------------- | ---------------------------------- |
| `mapNotificationItemToViewModel`        | `NotificationItem`   | `NotificationViewModel`            |
| `mapNotificationDtoToViewModel`         | alias                | same                               |
| `mapNotificationItemsToViewModels`      | `NotificationItem[]` | frozen array                       |
| `sortNotificationViewModelsByPriority`  | view models          | sorted array                       |
| `groupNotificationViewModelsByPriority` | view models          | priority groups                    |
| `presentNotificationsFromItems`         | service items        | view models + groups + diagnostics |

---

## Immutability

Factories return frozen objects via `freezeNotificationViewModel()` and `freezeNotificationPriorityGroup()`.

---

## Related specs

- [Notification Presentation Layer](./SPR-006-ENF-notification-presentation-layer.md)
- [Notification Item](./SPR-006-ENF-notification-item.md)

---

_SPR-006 Notification View Model — EN-012._
