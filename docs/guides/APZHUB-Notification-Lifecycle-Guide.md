# APZHUB Notification Lifecycle Guide

**Milestone:** APZNOTIFY-001  
**Package:** `@apzhub/notification-core`

---

## States

`draft` → `pending` → `queued` → `delivered` → `read` → `acknowledged` → `dismissed` → `expired` → `archived`

Transitions are fail-closed. Same-state updates are allowed (idempotent).

## Allowed transitions (summary)

| From | To |
| --- | --- |
| draft | pending, expired, archived |
| pending | queued, draft, dismissed, expired, archived |
| queued | delivered, dismissed, expired, archived |
| delivered | read, acknowledged, dismissed, expired, archived |
| read | acknowledged, dismissed, expired, archived |
| acknowledged | dismissed, expired, archived |
| dismissed | expired, archived |
| expired | archived |
| archived | _(terminal)_ |

## Helpers

- `canTransitionNotificationLifecycle(from, to)`
- `assertNotificationLifecycleTransition(from, to)`
- `listAllowedNotificationLifecycleTransitions(from)`

No delivery engine advances status automatically in this milestone.
