# APZNOTIFY-005 — Architecture Audit

**Result:** PASS — 0 unexplained violations (vertical audit + prior 001–004)

## Path integrity

| Layer | Evidence |
| --- | --- |
| Workbench | `apps/web/components/notifications/*` → `@/lib/notifications/notification-api` only |
| Typed client | `createHttpNotificationClient()` → `/api/v1/notifications/*` only |
| HTTP | Route handlers → `lib/api/v1/handlers/notifications*` → `getPlatformServiceGateway().notification.*` |
| Gateway | Nested `gateway.notification.{notifications,templates,preferences,categories,channels,recipients,references,audit,diagnostics}` |
| Pipeline | Public gateway ops wrapped by RequestPipeline (platform-services) |
| Authz | `PLATFORM_NOTIFICATION_PERMISSIONS` + `notificationPlatformOps` |
| Services | Thin delegation into Notification Core / persistence ports |
| Core | Lifecycle / validation / business rules — no external delivery calls |
| Persistence | PostgreSQL repositories + in-memory test implementations; platform migrations |

## Confirmed absences

No second gateway, RequestPipeline, or authz framework for Notifications. No delivery-provider package dependency. No circular deps across contracts → core → persistence → platform-services → apps.
