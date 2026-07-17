# Notification Consumer Guide (APZNOTIFY-003)

Prefer `apps/web/lib/notifications` typed client. Do not call PlatformServiceGateway from UI. Do not invent delivery calls. When `APZHUB_NOTIFICATION_ENABLED` is false, expect `503`. Future Workbench (APZNOTIFY-004) must consume this client only.
