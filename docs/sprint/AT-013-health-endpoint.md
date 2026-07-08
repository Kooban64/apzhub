# AT-013 — Health Endpoint Extension

> **Story:** AT-013  
> **Endpoint:** `GET /api/health`

---

## New fields

| Field        | Type                             | Loader                                 |
| ------------ | -------------------------------- | -------------------------------------- |
| `activities` | `ActivityFrameworkHealthSummary` | `loadActivityFrameworkHealthSummary()` |
| `timelines`  | `TimelineFrameworkHealthSummary` | `loadTimelineFrameworkHealthSummary()` |

Defined in `@apzhub/types` (`PlatformHealthResponse`).

---

## `activities` summary

| Property                                    | Source                                          |
| ------------------------------------------- | ----------------------------------------------- |
| `status`                                    | Bootstrap + filter health derivation            |
| `frameworkStatus`                           | `ACTIVITY_TIMELINE_FRAMEWORK_STATUS`            |
| `layerStatus`                               | Activity registry diagnostics                   |
| `registeredTypeCount` / `filteredTypeCount` | Hydration diagnostics                           |
| `platformTypeCount` / `capabilityTypeCount` | Source split                                    |
| `serviceStatus` / `storedCount`             | `DefaultActivityService.getDiagnostics()`       |
| `viewedCount` / `unviewedCount`             | `0` / `storedCount` (no user state in AT-013)   |
| `mapperStatus` / `mappedCount`              | Activity mapper diagnostics                     |
| `lastBootstrapStatus`                       | `bootstrapActivityRegistry()` outcome           |
| `subscriberRegistered`                      | `wireAppActivityTimeline()` on shared Event Bus |

---

## `timelines` summary

| Property                                            | Source                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `status`                                            | Bootstrap + filter health derivation                         |
| `frameworkStatus`                                   | Package status constant                                      |
| `layerStatus`                                       | Timeline registry diagnostics                                |
| `registeredTimelineCount` / `filteredTimelineCount` | Hydration diagnostics                                        |
| `platformTimelineCount` / `capabilityTimelineCount` | Source split                                                 |
| `activeScopeCount` / `scopeCounts`                  | Timeline registry scope counts                               |
| `lastBootstrapStatus`                               | `bootstrapTimelineRegistry()` outcome                        |
| `hydrationStatus`                                   | Bundle/registry hydration (`empty` · `hydrated` · `invalid`) |

---

## Implementation

| File                                       | Role            |
| ------------------------------------------ | --------------- |
| `apps/web/lib/activity-timeline-health.ts` | Health loaders  |
| `apps/web/app/api/health/route.ts`         | Route extension |

Loaders read server-side `AppActivityTimelineContext` only — no client bundle duplication.

---

## Dev diagnostics

`ActivityTimelineDiagnostics` (`data-testid="activity-timeline-diagnostics"`) mounted in non-production builds via `ActionWorkbenchShellProvider`.

---

_AT-013 health endpoint — SPR-007._
