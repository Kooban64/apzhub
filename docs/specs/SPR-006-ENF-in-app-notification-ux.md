# SPR-006 — In-App Notification UX Notes

> **Story:** EN-013  
> **Status:** Implemented  
> **Scope:** Badge + panel only — no toast, banner, email, SMS, push, webhook

---

## Surfaces

### Notification Badge

- Location: shell header trailing area
- Shows **Notifications** label + numeric badge when unread > 0
- Caps display at **99+**
- `aria-label` includes unread count for screen readers
- When panel enabled: badge acts as toggle (`aria-pressed`)

### Notification Panel

- Location: popover anchored below header actions (`absolute`, max width 24rem)
- Header: title + **Mark all read** (when unread exist)
- Body: priority groups with section labels (Urgent, High priority, Normal, Low priority)
- Items: title, optional body, relative timestamp, severity left border
- Unread items: muted background highlight
- Per-item **Mark read** when unread
- **Open action** button when `actionRef` is present

---

## Empty state

| Field       | Default                  |
| ----------- | ------------------------ |
| Title       | `No notifications`       |
| Description | `You are all caught up.` |

Customisable via `NotificationPanel` `emptyState` prop.

---

## Read state UX

| Service state | Presentation                          | Panel styling                |
| ------------- | ------------------------------------- | ---------------------------- |
| Unread        | `readState: unread`, `isUnread: true` | Highlight + Mark read button |
| Read          | `readState: read`, `isUnread: false`  | No mark button               |

Mark read operations call **Notification Service** only — presentation layer reflects updated service state on next render.

---

## Action delegation UX

When a notification includes `actionRef`:

1. User clicks **Open action**
2. Experience calls `delegateNotificationActionRef(actionRef, { execute })`
3. Action Framework runs the registered action with optional `handlerContext`
4. Optional `onNotificationActionExecuted(actionId)` callback fires on success

Experiences do not invoke handlers directly.

---

## Enable flag combinations

| Badge | Panel | Behaviour                            |
| ----- | ----- | ------------------------------------ |
| off   | off   | No notification UI                   |
| on    | off   | Badge shows count; no panel          |
| off   | on    | **Notifications** toggle opens panel |
| on    | on    | Badge toggles panel; count visible   |

---

## Deferred (out of EN-013 scope)

- Toast popups
- Banner system
- Email / SMS / push / webhook delivery
- Persistent notification history
- App bootstrap wiring (EN-015)
- End-to-end Event Bus → mapper → service pipeline (EN-014)

---

## Test hooks

| `data-testid`                 | Element                  |
| ----------------------------- | ------------------------ |
| `workbench-notifications`     | Shell composer root      |
| `notification-badge`          | Badge button             |
| `notification-badge-count`    | Unread count pill        |
| `notification-panel`          | Panel region             |
| `notification-panel-empty`    | Empty state              |
| `notification-mark-all-read`  | Mark all control         |
| `notification-mark-read-{id}` | Per-item mark read       |
| `notification-action-{id}`    | Action delegation button |
| `notification-diagnostics`    | Hidden diagnostics       |

---

_SPR-006 In-App Notification UX — EN-013._
