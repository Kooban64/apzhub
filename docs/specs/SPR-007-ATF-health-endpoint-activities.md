# SPR-007 — Health Endpoint Activity Fields

> **Story:** AT-013  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Endpoint:** `GET /api/health`  
> **Status:** Specification — **no implementation**  
> **Authority:** [SPR-006 Health endpoint](./SPR-006-ENF-health-endpoint-events-notifications.md) · [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md)

---

## 1. Purpose

Extend `/api/health` with **activities** and **timelines** response fields summarising Activity & Timeline Framework bootstrap, registry, mapper, service, and hydration health.

Production operators use health endpoint — not dev-only diagnostics UI.

---

## 2. New response fields

| Field        | Type                             | Source                                 |
| ------------ | -------------------------------- | -------------------------------------- |
| `activities` | `ActivityFrameworkHealthSummary` | `loadActivityFrameworkHealthSummary()` |
| `timelines`  | `TimelineFrameworkHealthSummary` | `loadTimelineFrameworkHealthSummary()` |

Defined in `@apzhub/types` (`PlatformHealthResponse` extension — AT-013).

Existing `events` and `notifications` fields unchanged (M6).

---

## 3. `activities` shape

| Property               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `status`               | `healthy` · `degraded` · `unhealthy`                       |
| `frameworkStatus`      | `ActivityTimelineContext.getDiagnostics().frameworkStatus` |
| `layerStatus`          | Activity registry layer status                             |
| `registeredTypeCount`  | Registered activity types                                  |
| `filteredTypeCount`    | Permission-filtered visible types                          |
| `platformTypeCount`    | Built-in catalogue types                                   |
| `capabilityTypeCount`  | Manifest-derived types                                     |
| `serviceStatus`        | Activity Service diagnostics status                        |
| `storedCount`          | Session store item count                                   |
| `viewedCount`          | Viewed activity count                                      |
| `unviewedCount`        | Unviewed activity count                                    |
| `mapperStatus`         | Activity Mapper diagnostics status                         |
| `mappedCount`          | Lifetime mapped item count                                 |
| `lastBootstrapStatus`  | Last `bootstrapActivityRegistry()` outcome                 |
| `subscriberRegistered` | Activity mapper subscribed on Event Bus                    |

### 3.1 Status derivation

| Condition                                         | `status`    |
| ------------------------------------------------- | ----------- |
| Bootstrap ok, mapper subscribed, service ready    | `healthy`   |
| Bootstrap ok, store empty, mapper ready           | `healthy`   |
| Bootstrap failed or mapper not subscribed         | `unhealthy` |
| Partial bootstrap (catalogue ok, manifest failed) | `degraded`  |
| Hydration invalid                                 | `degraded`  |

---

## 4. `timelines` shape

| Property                  | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `status`                  | `healthy` · `degraded` · `unhealthy`                       |
| `frameworkStatus`         | Package framework status constant                          |
| `layerStatus`             | Timeline registry layer status                             |
| `registeredTimelineCount` | Registered timelines                                       |
| `filteredTimelineCount`   | Permission-filtered visible timelines                      |
| `platformTimelineCount`   | Built-in catalogue timelines                               |
| `capabilityTimelineCount` | Manifest-derived timelines                                 |
| `activeScopeCount`        | Scopes with at least one active timeline                   |
| `scopeCounts`             | Count by scope (`personal`, `workspace`, `system`, `team`) |
| `lastBootstrapStatus`     | Last `bootstrapTimelineRegistry()` outcome                 |
| `hydrationStatus`         | Client provider hydration status                           |

---

## 5. Example (partial)

```json
{
  "events": {
    "status": "healthy",
    "registeredCount": 12,
    "subscriberCount": 2
  },
  "notifications": {
    "status": "healthy",
    "registeredRouteCount": 8,
    "storedCount": 0
  },
  "activities": {
    "status": "healthy",
    "frameworkStatus": "ready",
    "layerStatus": "registry",
    "registeredTypeCount": 8,
    "filteredTypeCount": 8,
    "platformTypeCount": 4,
    "capabilityTypeCount": 4,
    "serviceStatus": "empty",
    "storedCount": 0,
    "viewedCount": 0,
    "unviewedCount": 0,
    "mapperStatus": "ready",
    "mappedCount": 0,
    "lastBootstrapStatus": "ok",
    "subscriberRegistered": true
  },
  "timelines": {
    "status": "healthy",
    "frameworkStatus": "ready",
    "layerStatus": "registry",
    "registeredTimelineCount": 3,
    "filteredTimelineCount": 3,
    "platformTimelineCount": 2,
    "capabilityTimelineCount": 1,
    "activeScopeCount": 2,
    "scopeCounts": {
      "personal": 1,
      "workspace": 1,
      "system": 1,
      "team": 0
    },
    "lastBootstrapStatus": "ok",
    "hydrationStatus": "hydrated"
  }
}
```

---

## 6. Loader functions (planned)

| Function                              | Path                                                           | Role                      |
| ------------------------------------- | -------------------------------------------------------------- | ------------------------- |
| `loadActivityFrameworkHealthSummary`  | `apps/web/src/server/health/load-activity-framework-health.ts` | Aggregate activity health |
| `loadTimelineFrameworkHealthSummary`  | `apps/web/src/server/health/load-timeline-framework-health.ts` | Aggregate timeline health |
| `loadActivityTimelineFrameworkHealth` | Combined loader for both fields                                | AT-013 integration        |

Loaders read from server-side `ActivityTimelineContext` — not client providers.

---

## 7. Health check sources

| Check                       | Source                                                   |
| --------------------------- | -------------------------------------------------------- |
| Activity registry bootstrap | `bootstrapActivityRegistry` diagnostics                  |
| Timeline registry bootstrap | `bootstrapTimelineRegistry` diagnostics                  |
| Mapper subscriber status    | Activity mapper diagnostics + Event Bus subscriber count |
| Service store               | ActivityService.getDiagnostics()                         |
| Hydration                   | Server hydration bundle validation status                |

---

## 8. Relationship to Event Bus health

`events.subscriberCount` includes **both** NotificationMapper and ActivityMapper subscribers after AT-013 wiring.

Activity-specific subscriber confirmation uses `activities.subscriberRegistered` — avoids inferring from aggregate count alone.

---

## 9. Dev diagnostics UI

`ActivityTimelineDiagnostics` component (`data-testid="activity-timeline-diagnostics"`) exposes extended hydration counts in non-production builds for AT-014 E2E seeding.

See [SPR-007-ATF-diagnostics.md](./SPR-007-ATF-diagnostics.md).

---

## 10. Architectural boundaries

| Rule                                          | AT-013 |
| --------------------------------------------- | ------ |
| Health reads server context only              | ✅     |
| No client bundle health logic duplication     | ✅     |
| No secrets or raw payloads in health response | ✅     |
| Redacted counts only                          | ✅     |

---

## 11. Related

- [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md)
- [Diagnostics spec](./SPR-007-ATF-diagnostics.md)
- [SPR-006 Health endpoint](./SPR-006-ENF-health-endpoint-events-notifications.md)

---

_SPR-007 Health Endpoint Activity Fields — AT-013 specification._
