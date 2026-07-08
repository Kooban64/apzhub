# SPR-006 — Notification Experiences

> **Story:** EN-013  
> **Status:** Implemented  
> **Package:** `@apzhub/workspace`  
> **Authority:** [Notification Presentation Layer](./SPR-006-ENF-notification-presentation-layer.md)

---

## Purpose

Define the first **in-app Notification Experiences** — shell-facing badge and panel surfaces that consume the Notification Presentation Layer and Notification Service read APIs.

No toast redesign, external delivery, persistence, mapper execution, or Event Bus publish.

---

## Experiences

| Experience         | Component                     | Surface id           |
| ------------------ | ----------------------------- | -------------------- |
| Notification Badge | `NotificationBadgeExperience` | `notification-badge` |
| Notification Panel | `NotificationPanelExperience` | `notification-panel` |
| Shell composer     | `WorkbenchNotifications`      | both                 |

Path: `packages/workspace/src/notifications/`

---

## Pipeline

```text
NotificationService (session store)
        ↓
useNotificationPresentation()
        ↓
NotificationBadgeExperience / NotificationPanelExperience
        ↓
DesktopShell header (enable flags)
```

Action delegation:

```text
NotificationViewModel.actionRef
        ↓
delegateNotificationActionRef()
        ↓
useCommandRegistry().execute()
```

---

## DesktopShell integration

Requires ancestors:

- `NotificationServiceProvider` (`@apzhub/event-notification-framework/react`)
- `CommandRegistryProvider` (panel action delegation)

| Prop                            | Default | Purpose                     |
| ------------------------------- | ------- | --------------------------- |
| `enableNotificationBadge`       | `false` | Header unread badge         |
| `enableNotificationPanel`       | `false` | Popover notification list   |
| `notificationPanelOpen`         | —       | Controlled panel open state |
| `onNotificationPanelOpenChange` | —       | Panel open callback         |
| `onNotificationActionExecuted`  | —       | Post-execute callback       |

Badge click toggles panel when both flags are enabled. Panel-only mode renders a **Notifications** toggle button.

Header slot: `ShellLayout.headerTrailing` → `WorkbenchNotifications`.

---

## Panel capabilities

- Priority-grouped list from presentation layer
- Relative timestamps
- Read/unread visual state
- **Mark read** per item → `NotificationService.markAsRead()`
- **Mark all read** → `NotificationService.markAllAsRead()`
- Empty state when no notifications
- **Open action** when `actionRef` present → Action Framework `execute()`

---

## Diagnostics

Hidden span `data-testid="notification-diagnostics"` on each experience:

| Attribute           | Meaning                                      |
| ------------------- | -------------------------------------------- |
| `data-surface`      | `notification-badge` or `notification-panel` |
| `data-unread-count` | Unread count                                 |
| `data-total-count`  | Total view models                            |
| `data-panel-open`   | Panel open (panel surface only)              |

Builder: `buildNotificationExperienceDiagnostics()`.

---

## Boundary rules

| Allowed                               | Forbidden                           |
| ------------------------------------- | ----------------------------------- |
| Consume presentation + service APIs   | Store notifications directly        |
| Mark read via service methods         | Execute mappers                     |
| Delegate actions via Action Framework | Publish events                      |
| Render badge + panel UI               | External delivery                   |
|                                       | Bypass Notification Service         |
|                                       | Bypass Action Framework for actions |

---

## Related specs

- [In-app Notification UX](./SPR-006-ENF-in-app-notification-ux.md)
- [Notification Presentation Layer](./SPR-006-ENF-notification-presentation-layer.md)
- [Notification Service](./SPR-006-ENF-notification-service.md)

---

_SPR-006 Notification Experiences — EN-013._
