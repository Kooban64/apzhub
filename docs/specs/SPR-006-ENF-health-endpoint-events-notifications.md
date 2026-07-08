# SPR-006 — Health Endpoint Event & Notification Fields

> **Story:** EN-015  
> **Endpoint:** `GET /api/health`

---

## New response fields

| Field           | Type                                 | Source                                     |
| --------------- | ------------------------------------ | ------------------------------------------ |
| `events`        | `EventFrameworkHealthSummary`        | `loadEventFrameworkHealthSummary()`        |
| `notifications` | `NotificationFrameworkHealthSummary` | `loadNotificationFrameworkHealthSummary()` |

Defined in `@apzhub/types` (`PlatformHealthResponse`).

---

## `events` shape

| Property               | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `status`               | `healthy` · `degraded` · `unhealthy`                           |
| `frameworkStatus`      | `EventNotificationContext.getDiagnostics().frameworkStatus`    |
| `layerStatus`          | Event registry layer status                                    |
| `registeredCount`      | Registered events                                              |
| `filteredCount`        | Permission-filtered visible events                             |
| `platformEventCount`   | Built-in catalogue events                                      |
| `capabilityEventCount` | Manifest-derived events                                        |
| `publishCount`         | In-process Event Bus publish count (server hydration instance) |
| `lastPublishStatus`    | Last bus publish outcome                                       |
| `subscriberCount`      | Active bus subscriptions (includes mapper subscriber)          |

---

## `notifications` shape

| Property               | Description                             |
| ---------------------- | --------------------------------------- |
| `status`               | Hydration health from route counts      |
| `frameworkStatus`      | Package framework status constant       |
| `layerStatus`          | Notification layer status               |
| `registeredRouteCount` | Registered notification routes          |
| `filteredRouteCount`   | Permission-filtered routes              |
| `platformRouteCount`   | Built-in catalogue routes               |
| `capabilityRouteCount` | Manifest-derived routes                 |
| `serviceStatus`        | Notification Service diagnostics status |
| `storedCount`          | Session store item count                |
| `unreadCount`          | Unread notification count               |
| `mapperStatus`         | Notification Mapper diagnostics status  |
| `mappedCount`          | Lifetime mapped item count              |

---

## Example (partial)

```json
{
  "events": {
    "status": "healthy",
    "frameworkStatus": "ready",
    "layerStatus": "audit",
    "registeredCount": 12,
    "filteredCount": 12,
    "publishCount": 0,
    "lastPublishStatus": "none",
    "subscriberCount": 1
  },
  "notifications": {
    "status": "healthy",
    "serviceStatus": "empty",
    "mapperStatus": "ready",
    "registeredRouteCount": 8,
    "storedCount": 0,
    "unreadCount": 0
  }
}
```

---

## Dev diagnostics

`EventNotificationDiagnostics` component (`data-testid="event-notification-diagnostics"`) exposes hydration counts in non-production builds for EN-016 E2E seeding.

---

_EN-015 health endpoint documentation — complete._
