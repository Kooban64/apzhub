# SPR-007 — Activity & Timeline Diagnostics

> **Story:** AT-001 · AT-013 · AT-014  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Health endpoint activities field](./SPR-007-ATF-health-endpoint-activities.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define **diagnostics surfaces** for the Activity & Timeline Framework — `getDiagnostics()` contracts, dev-only UI, hidden E2E testids, and production guard rules.

Production operators use `/api/health` — not dev diagnostics UI.

---

## 2. Diagnostics hierarchy

```text
ActivityTimelineContext.getDiagnostics()     — framework aggregate
        ├── ActivityRegistry.getDiagnostics()
        ├── TimelineRegistry.getDiagnostics()
        ├── ActivityMapper.getDiagnostics()
        ├── ActivityService.getDiagnostics()
        └── Hydration diagnostics (server + client)
```

Each subsystem exposes `getDiagnostics()` returning frozen snapshot objects.

---

## 3. Framework aggregate diagnostics

```typescript
interface ActivityTimelineFrameworkDiagnostics {
  readonly frameworkStatus: "scaffold" | "registry" | "mapper" | "service" | "ready";
  readonly frameworkVersion: string;
  readonly activityRegistry: ActivityRegistryDiagnostics;
  readonly timelineRegistry: TimelineRegistryDiagnostics;
  readonly mapper: ActivityMapperDiagnostics;
  readonly service: ActivityServiceDiagnostics;
  readonly hydration: ActivityTimelineHydrationDiagnostics;
  readonly layerStatus: string;
}
```

`createActivityTimelineContext().getDiagnostics()` returns aggregate.

---

## 4. Subsystem diagnostics (summary)

### 4.1 ActivityRegistryDiagnostics

| Field                             | Description                    |
| --------------------------------- | ------------------------------ |
| `status`                          | `empty` · `ready` · `degraded` |
| `totalCount` / `activeCount`      | Type counts                    |
| `platformCount` / `manifestCount` | Source split                   |
| `categoryCounts`                  | By category                    |
| `conflicts`                       | Last batch issues              |

See [Activity Registry spec](./SPR-007-ATF-activity-registry.md).

### 4.2 TimelineRegistryDiagnostics

| Field                        | Description                               |
| ---------------------------- | ----------------------------------------- |
| `status`                     | `empty` · `ready` · `degraded`            |
| `totalCount` / `activeCount` | Timeline counts                           |
| `scopeCounts`                | By scope                                  |
| `orphanedScopeReferences`    | Activity types referencing unknown scopes |

### 4.3 ActivityMapperDiagnostics

| Field                  | Description                        |
| ---------------------- | ---------------------------------- |
| `status`               | `idle` · `ready` · `error`         |
| `mappedCount`          | Lifetime mapped items              |
| `skippedCount`         | Duplicate/idempotent skips         |
| `errorCount`           | Isolated subscriber errors         |
| `lastMappedEventId`    | Last processed event id (redacted) |
| `lastMappedAt`         | ISO timestamp                      |
| `subscriberRegistered` | Event Bus subscription active      |

### 4.4 ActivityServiceDiagnostics

| Field                           | Description         |
| ------------------------------- | ------------------- |
| `status`                        | `empty` · `ready`   |
| `health`                        | `empty` · `healthy` |
| `activeActivityCount`           | Store size          |
| `viewedCount` / `unviewedCount` | Viewed state        |
| `scopeCounts`                   | By resolved scope   |
| `lastActivityTimestamp`         | Latest item         |

### 4.5 ActivityTimelineHydrationDiagnostics

| Field                                               | Description                        |
| --------------------------------------------------- | ---------------------------------- |
| `status`                                            | `pending` · `hydrated` · `invalid` |
| `registeredTypeCount` / `filteredTypeCount`         | Activity filter stats              |
| `registeredTimelineCount` / `filteredTimelineCount` | Timeline filter stats              |
| `bootstrapDurationMs`                               | Server bootstrap timing            |
| `hydratedAt`                                        | ISO timestamp                      |

---

## 5. Dev diagnostics component

`ActivityTimelineDiagnostics` — React component for non-production builds.

| Aspect      | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| Location    | `@apzhub/activity-timeline-framework/react/diagnostics`    |
| testid      | `activity-timeline-diagnostics`                            |
| Visibility  | Rendered only when `process.env.NODE_ENV !== 'production'` |
| Mount point | `apps/web` dev layout or test harness                      |

### 5.1 Displayed fields (dev)

- Framework status and version
- Registry counts (registered / filtered)
- Mapper mapped count and last event id
- Service store count
- Hydration status and timing

Raw event payloads **never** displayed — redacted summaries only.

---

## 6. Hidden E2E testids

Following M5/M6 pattern — hidden spans for Playwright assertions (AT-014).

### 6.1 Framework diagnostics

| testid                          | Attributes                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `activity-timeline-diagnostics` | `data-framework-status`, `data-type-count`, `data-timeline-count`, `data-stored-count`, `data-mapper-status` |

### 6.2 Experience diagnostics

| testid                                     | Attributes                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `activity-timeline-experience-diagnostics` | `data-surface`, `data-timeline-id`, `data-total-count`, `data-unviewed-count`, `data-group-count` |

Per-experience surfaces: `personal-timeline`, `workspace-activity-feed`, `context-panel-activity`.

See [Timeline Experiences spec](./SPR-007-ATF-timeline-experiences.md).

### 6.3 Builder functions

| Function                                       | Output                              |
| ---------------------------------------------- | ----------------------------------- |
| `buildActivityTimelineDiagnosticsAttributes()` | Framework dev span attrs            |
| `buildActivityExperienceDiagnostics()`         | Experience dev span attrs           |
| `buildActivityPresentationDiagnostics()`       | Presentation layer metrics (no DOM) |

---

## 7. Production guard

| Rule                                                         | Enforcement                                         |
| ------------------------------------------------------------ | --------------------------------------------------- |
| Dev diagnostics component not rendered in production         | `NODE_ENV` guard + build-time dead code elimination |
| E2E testids present in test/production builds for Playwright | Hidden spans — zero visual footprint                |
| `getDiagnostics()` callable in production server code        | Health endpoint aggregation only                    |
| Mapper trace (last N events)                                 | Dev flag `ACTIVITY_MAPPER_TRACE=1` — server only    |
| No raw payloads in diagnostics                               | Redaction enforced at mapper                        |

Client bundles **must not** ship dev diagnostics component in production entry paths when tree-shaking is insufficient — use dynamic import behind env guard.

---

## 8. Mapper trace (dev only)

Optional server-side trace when `ACTIVITY_MAPPER_TRACE=1`:

| Field            | Content                                                      |
| ---------------- | ------------------------------------------------------------ |
| `recentMappings` | Last 10 `{ eventId, activityTypeId, activityId, timestamp }` |
| Payload          | Excluded — event id and type id only                         |

Trace memory capped at 10 entries. Never exposed via public API — internal diagnostics accessor only.

---

## 9. Logging integration (scaffold)

Structured log events at bootstrap (Document 014 alignment):

| Event                                   | Level | Fields                           |
| --------------------------------------- | ----- | -------------------------------- |
| `activity.registry.bootstrap.completed` | info  | counts, duration, status         |
| `activity.registry.bootstrap.failed`    | error | issue codes                      |
| `activity.mapper.subscriber.registered` | info  | subscriber id                    |
| `activity.mapper.mapping.failed`        | warn  | eventId, error code (no payload) |

Full observability connector deferred — interface stub in extension points.

---

## 10. getDiagnostics() public exposure

| Consumer         | API                                             |
| ---------------- | ----------------------------------------------- |
| Health endpoint  | Server aggregate — redacted                     |
| Dev UI           | Full aggregate — non-production                 |
| E2E tests        | Hidden testid attributes                        |
| Experiences      | Presentation diagnostics via hook — counts only |
| External clients | **None** — no public REST diagnostics endpoint  |

---

## 11. Related

- [Health endpoint](./SPR-007-ATF-health-endpoint-activities.md)
- [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md)
- [SPR-006 Notification Experiences diagnostics](./SPR-006-ENF-notification-experiences.md) §Diagnostics

---

_SPR-007 Activity & Timeline Diagnostics — AT-001 / AT-013 / AT-014 specification._
