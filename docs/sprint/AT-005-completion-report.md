# AT-005 — Completion Report

> **Story:** AT-005 — Manifest-driven Activity & Timeline bootstrap  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-006**

---

## Objective

Implement manifest-driven Activity and Timeline bootstrap — register Activity Type and Timeline Definitions from platform catalogues and capability manifests. Definitions only — no Event Bus, mapping, Activity Service, timeline generation, or UI.

---

## Acceptance criteria

| Criterion                                                                         | Status |
| --------------------------------------------------------------------------------- | ------ |
| `activities.types` manifest extraction                                            | ✅     |
| `activities.timelines` manifest extraction (+ legacy `timelines.scopes` fallback) | ✅     |
| Platform Activity Type Catalogue (4 built-in types)                               | ✅     |
| `bootstrapActivityRegistry()`                                                     | ✅     |
| `bootstrapTimelineRegistry()`                                                     | ✅     |
| Atomic registration (`registerManyAtomic`)                                        | ✅     |
| Manifest validation                                                               | ✅     |
| Registry hydration diagnostics                                                    | ✅     |
| Source metadata (`builtin` / `manifest`)                                          | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "bootstrap"`                                | ✅     |
| Quality gates pass                                                                | ✅     |

---

## Architectural rule (enforced)

AT-005 registers **definitions only**. It does not subscribe to Event Bus, map events, store activity history, generate timelines, or render UI.

---

## Deliverables

| Artifact                        | Path                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Platform activity catalogue     | `packages/activity-timeline-framework/src/catalogue/platform-activity-catalogue.ts`                              |
| Activity bootstrap              | `packages/activity-timeline-framework/src/bootstrap/bootstrap-activity-registry.ts`                              |
| Timeline bootstrap              | `packages/activity-timeline-framework/src/bootstrap/bootstrap-timeline-registry.ts`                              |
| Manifest extraction             | `packages/activity-timeline-framework/src/extraction/`                                                           |
| Hydration diagnostics           | `packages/activity-timeline-framework/src/server/*-hydration-diagnostics.ts`                                     |
| Activity bootstrap spec         | [SPR-007-ATF-activity-bootstrap.md](../specs/SPR-007-ATF-activity-bootstrap.md)                                  |
| Manifest schema (updated)       | [SPR-007-ATF-activity-manifest.md](../specs/SPR-007-ATF-activity-manifest.md)                                    |
| Platform activity catalogue doc | [PLATFORM-ACTIVITY-CATALOGUE.md](../../packages/activity-timeline-framework/docs/PLATFORM-ACTIVITY-CATALOGUE.md) |
| Timeline bootstrap doc          | [TIMELINE-BOOTSTRAP.md](../../packages/activity-timeline-framework/docs/TIMELINE-BOOTSTRAP.md)                   |

---

## Platform Activity Type Catalogue

| activityTypeId                       | sourceEventPattern                     |
| ------------------------------------ | -------------------------------------- |
| `platform.lifecycle.started`         | `platform.lifecycle.started`           |
| `platform.action.executed`           | `capability.action.executed`           |
| `platform.knowledge.query.completed` | `capability.knowledge.query.completed` |
| `platform.notification.generated`    | `capability.notification.generated`    |

---

## Server exports

Bootstrap APIs are exported from `@apzhub/activity-timeline-framework/server`:

```typescript
import {
  bootstrapActivityRegistry,
  bootstrapTimelineRegistry,
  mapPlatformCapabilitiesToActivityRecords,
} from "@apzhub/activity-timeline-framework/server";
```

`createActivityTimelineContext()` still defaults to an empty Activity Registry and platform Timeline Registry — full manifest bootstrap wiring to Runtime is deferred to AT-013.

---

## Test results

| Suite                                                    | Result                  |
| -------------------------------------------------------- | ----------------------- |
| ATF unit tests                                           | ✅ 97 passed (13 files) |
| Full unit suite                                          | ✅ 1195 passed          |
| Coverage (`packages/activity-timeline-framework/src/**`) | ✅ ≥80% all metrics     |
| E2E                                                      | ✅ 30 passed            |

New test coverage:

- Manifest extraction (`activities.types`, `activities.timelines`, legacy fallback)
- Platform catalogue registration
- Atomic registration and duplicate detection
- Timeline bootstrap
- Hydration diagnostics
- Bootstrap repeatability
- Manifest schema validation branches

---

## Technical debt

| Item                         | Notes                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Template strings in manifest | `titleTemplate` / `summaryTemplate` / `bodyTemplate` validated in schema but not stored on descriptors — mapper execution deferred to AT-007 |
| Runtime wiring               | `bootstrapActivityRegistry()` / `bootstrapTimelineRegistry()` not yet invoked from `Runtime.bootstrap()` — AT-013                            |
| Legacy manifest block        | `timelines.scopes[]` supported as fallback; capabilities should migrate to `activities.timelines[]`                                          |
| DI defaults                  | Context still uses empty activity registry — bootstrap is opt-in until app integration                                                       |

---

## Recommendation for AT-006

1. Implement Activity Registry DTO filter via Platform Permission Adapter — permission-filtered descriptor lists for client hydration
2. Add `buildActivityRegistryDto()` / visibility projection mirroring ENF event registry DTO pattern
3. Do not wire mapper or Event Bus — AT-006 is DTO filter only per sprint plan
4. Reuse `ActivityRegistryHydrationDiagnostics` registered vs filtered counts once DTO filter exists

---

## Stop condition

**AT-005 complete.** Await owner approval before AT-006 (Activity Registry DTO filter).

---

_AT-005 Completion Report — SPR-007 Milestone 7._
