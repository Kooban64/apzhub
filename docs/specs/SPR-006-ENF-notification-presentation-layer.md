# SPR-006 — Notification Presentation Layer

> **Story:** EN-012  
> **Status:** Implemented  
> **Authority:** [Notification Architecture](./SPR-006-ENF-notification-architecture.md) · [Notification Service](./SPR-006-ENF-notification-service.md)

---

## Purpose

Define the **Notification Presentation Layer** — reusable helpers that convert `NotificationItem` / service read state into UI-ready view models for future Experiences.

**Does not:** store notifications, deliver notifications, publish events, execute actions, mutate Notification Service state, or render shell UI.

---

## Pipeline

```text
NotificationItem (from Notification Service)
        ↓
mapNotificationItemToViewModel()
        ↓
sortNotificationViewModelsByPriority()
        ↓
groupNotificationViewModelsByPriority()
        ↓
buildNotificationPresentationDiagnostics()
        ↓
Future Experiences (EN-013+)
```

---

## Components

| Component                                  | Path                                                         | Role                   |
| ------------------------------------------ | ------------------------------------------------------------ | ---------------------- |
| `NotificationViewModel`                    | `src/presentation/notification-view-model.ts`                | UI-ready model         |
| `mapNotificationItemToViewModel`           | `src/presentation/map-notification-item-to-view-model.ts`    | Item → view model      |
| `mapNotificationDtoToViewModel`            | same                                                         | Backlog alias          |
| `sortNotificationViewModelsByPriority`     | `src/presentation/group-notifications.ts`                    | Priority ordering      |
| `groupNotificationViewModelsByPriority`    | `src/presentation/group-notifications.ts`                    | Priority buckets       |
| `formatNotificationRelativeTimestamp`      | `src/presentation/format-notification-relative-timestamp.ts` | Relative time labels   |
| `buildNotificationPresentationDiagnostics` | `src/presentation/notification-presentation-diagnostics.ts`  | Presentation metrics   |
| `presentNotificationsFromItems`            | same                                                         | Map + group + diagnose |
| `useNotificationPresentation`              | `src/react/use-notification-presentation.ts`                 | React hook             |

---

## View model mapping

Input: immutable `NotificationItem` from `NotificationService` (read-only).

Output fields include:

| Field                              | Source                                                  |
| ---------------------------------- | ------------------------------------------------------- |
| `title`, `body`, `kind`, `channel` | Item                                                    |
| `priority`, `severity`             | Item priority → presentation severity                   |
| `timestamp`, `relativeTimestamp`   | Item timestamp + formatter                              |
| `readState`, `isUnread`            | `metadata.read`                                         |
| `actionRef`                        | Passthrough for Action Framework `execute()` delegation |
| `category`, `correlationId`        | Item metadata                                           |

Severity mapping:

| Priority | Severity   |
| -------- | ---------- |
| `urgent` | `critical` |
| `high`   | `warning`  |
| `normal` | `info`     |
| `low`    | `subtle`   |

---

## Priority ordering

Sort order:

1. Priority weight (`urgent` → `high` → `normal` → `low`)
2. Timestamp descending within the same priority

---

## Grouping

`groupNotificationViewModelsByPriority()` returns `NotificationPriorityGroup[]`:

- `key` / `priority` / `label` / `severity`
- `items` — view models in group
- `unreadCount` — unread items in group

Empty priority buckets are omitted by default (`includeEmptyGroups: true` to include).

---

## Relative timestamps

`formatNotificationRelativeTimestamp(timestamp, { now, locale })`:

| Elapsed    | Label             |
| ---------- | ----------------- |
| < 1 minute | `Just now`        |
| < 1 hour   | `Xm ago`          |
| < 24 hours | `Xh ago`          |
| < 7 days   | `Xd ago`          |
| ≥ 7 days   | Locale short date |

Inject `now` for deterministic tests.

---

## Presentation diagnostics

| Field                       | Meaning                                        |
| --------------------------- | ---------------------------------------------- |
| `totalCount`                | View model count                               |
| `unreadCount` / `readCount` | Read state counts                              |
| `priorityCounts`            | Count by priority                              |
| `kindCounts`                | Count by kind                                  |
| `groupCount`                | Priority group count                           |
| `status`                    | `empty` or `ready`                             |
| `layerStatus`               | `NOTIFICATION_LAYER_STATUS` (`"presentation"`) |

---

## React hook

```typescript
import {
  NotificationServiceProvider,
  useNotificationPresentation,
} from "@apzhub/event-notification-framework/react";

const { viewModels, groups, diagnostics, markAsRead } = useNotificationPresentation({
  now: optionalFixedClock,
});
```

Requires `NotificationServiceProvider`. Presentation mapping is derived; service mutations flow through existing service APIs only.

---

## Boundary rules

| Allowed                          | Forbidden                     |
| -------------------------------- | ----------------------------- |
| Map service items to view models | Store notifications           |
| Sort and group view models       | Deliver notifications         |
| Format timestamps                | Publish events                |
| Passthrough `actionRef`          | Execute actions               |
| Presentation diagnostics         | Mutate service state directly |
|                                  | Render shell UI               |

---

## Related specs

- [Notification View Model](./SPR-006-ENF-notification-view-model.md)
- [Notification Service](./SPR-006-ENF-notification-service.md)
- [Notification Item](./SPR-006-ENF-notification-item.md)

---

_SPR-006 Notification Presentation Layer — EN-012._
