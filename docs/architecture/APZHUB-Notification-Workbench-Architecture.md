# APZHUB Notification Workbench Architecture

**Milestone:** APZNOTIFY-004  
**Route:** `/workspace/notifications`

```text
Notification Workbench
→ notification typed client (apps/web/lib/notifications)
→ /api/v1/notifications
→ gateway.notification.*
→ … → PostgreSQL
```

Manifest-driven Activity Bar + Sidebar under `packages/workbench-framework/manifests/platform-notifications*`. Catch-all workspace page mounts `NotificationsWorkspaceRouter` — no duplicate `app/workspace/notifications` tree.

**Delivery providers are not available.** No send, realtime, Event Bus, workers, or queues in UI.
