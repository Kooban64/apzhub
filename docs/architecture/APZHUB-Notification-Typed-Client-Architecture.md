# Notification Typed Client Architecture (APZNOTIFY-003)

Location: `apps/web/lib/notifications`

| Export | Role |
| --- | --- |
| `createHttpNotificationClient()` | Production HTTP client → `/api/v1/notifications` only |
| `createMockNotificationClient()` | In-memory test double |
| `getNotificationClient` / `setNotificationClient` / `resetNotificationClient` | Runtime accessor |
| `notificationQueryKeys` | React Query keys (tenant-isolated by caller context) |

Constraints: no server-only imports; no `platform-services` / `notification-core` / persistence; no delivery methods; AbortSignal supported; standard envelopes parsed.
