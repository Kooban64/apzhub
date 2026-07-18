# APZHUB Notification Authorization Guide

**Milestone:** APZNOTIFY-002

Production Authorization only — deny-by-default. Mappings live in `operation-authorization-map.ts` (`notificationPlatformOps`).

| Service key                 | Example ops                                      | Permission                |
| --------------------------- | ------------------------------------------------ | ------------------------- |
| `notificationNotifications` | list/get                                         | `notification.read`       |
| `notificationNotifications` | create/updateMetadata/archive/restore/transition | `notification.manage`     |
| `notificationTemplates`     | *                                                | `notification.template`   |
| `notificationPreferences`   | *                                                | `notification.preference` |
| `notificationAudit`         | list/get                                         | `notification.audit`      |
| `notificationDiagnostics`   | health/readiness/capabilities                    | `notification.read`       |

Catalogue: `PLATFORM_NOTIFICATION_PERMISSIONS` spread into `PLATFORM_SERVICE_PERMISSION_CATALOGUE`.
