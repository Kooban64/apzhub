# AT-006 — Completion Report

> **Story:** AT-006 — Activity & Timeline Registry DTO  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-007**

---

## Objective

Implement server-facing Activity Registry DTO and Timeline Registry DTO with mapping, validation, permission filtering, hydration diagnostics, and schema versioning — mirroring Action, Knowledge, Event, and Notification framework hydration patterns.

---

## Acceptance criteria

| Criterion                                                                                     | Status |
| --------------------------------------------------------------------------------------------- | ------ |
| `ActivityRegistryDto` wire format                                                             | ✅     |
| `TimelineRegistryDto` wire format                                                             | ✅     |
| `mapActivityRegistryDto()` / `mapTimelineRegistryDto()`                                       | ✅     |
| `validateActivityRegistryDto()` / `validateTimelineRegistryDto()`                             | ✅     |
| `filterActivityRegistryDto()` / `filterTimelineRegistryDto()` via Platform Permission Adapter | ✅     |
| `ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION = 1`                                                    | ✅     |
| `TIMELINE_REGISTRY_DTO_SCHEMA_VERSION = 1`                                                    | ✅     |
| Hydration diagnostics (registered, filtered, builtin, manifest, framework, schema)            | ✅     |
| Server exports from `@apzhub/activity-timeline-framework/server`                              | ✅     |
| No Event Bus, mapper, service, UI, or apps/web wiring                                         | ✅     |
| Quality gates pass                                                                            | ✅     |

---

## Architectural rule (enforced)

Server DTO layer only. Permission evaluation delegates to `WorkbenchPermissionAdapter` — the Activity Framework does not evaluate permissions inline.

---

## Deliverables

| Artifact                | Path                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Activity DTO mapping    | `src/server/filter/map-activity-registry-dto.ts`                                               |
| Timeline DTO mapping    | `src/server/filter/map-timeline-registry-dto.ts`                                               |
| DTO validation          | `src/server/filter/validate-*-registry-dto.ts`                                                 |
| Permission filtering    | `src/server/filter/filter-*-registry-dto.ts`                                                   |
| Hydration diagnostics   | `src/server/*-registry-hydration-diagnostics.ts`                                               |
| Registry DTO spec       | [SPR-007-ATF-activity-registry-dto.md](../specs/SPR-007-ATF-activity-registry-dto.md)          |
| Hydration documentation | [REGISTRY-HYDRATION.md](../../packages/activity-timeline-framework/docs/REGISTRY-HYDRATION.md) |

---

## Server API

```typescript
import {
  mapActivityRegistryDto,
  filterActivityRegistryDto,
  validateActivityRegistryDto,
  mapTimelineRegistryDto,
  filterTimelineRegistryDto,
  validateTimelineRegistryDto,
  buildActivityRegistryHydrationDiagnostics,
  buildTimelineRegistryHydrationDiagnostics,
} from "@apzhub/activity-timeline-framework/server";
```

---

## Test results

| Suite                                                    | Result                                   |
| -------------------------------------------------------- | ---------------------------------------- |
| ATF unit tests                                           | ✅ 117 passed (15 files)                 |
| Full unit suite                                          | ✅ 1215 passed                           |
| Coverage (`packages/activity-timeline-framework/src/**`) | ✅ ≥80% all metrics                      |
| E2E                                                      | ✅ 30 passed (unchanged — no app wiring) |

New test coverage: DTO mapping, validation, permission filtering, diagnostics, versioning.

---

## Technical debt

| Item                                             | Notes                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `buildActivityTimelineHydrationDto()` bundle     | Deferred to AT-009 — combined hydration envelope                                          |
| Client `createActivityTimelineContextFromDto()`  | Deferred to AT-009                                                                        |
| Visibility/status DTO exclusion rules in spec §9 | Not implemented in filter — mirrors ENF adapter-only filtering; visibility gates deferred |
| Template strings                                 | Remain server-side; not included in DTO (by design)                                       |
| Runtime / health wiring                          | Deferred to AT-013 / AT-014                                                               |

---

## Recommendation for AT-007

1. Implement `EventToActivityMapper` — subscribe to Event Bus and map events to ActivityDocuments using registered activity type definitions
2. Use `sourceEventPattern` from bootstrapped registry + platform catalogue for matching
3. Keep mapper separate from DTO filter path — mapper reads registry, does not mutate DTO layer
4. Do not wire React providers or Activity Service population until AT-008 / AT-009

---

## Stop condition

**AT-006 complete.** Await owner approval before AT-007 (Activity Mapper).

---

_AT-006 Completion Report — SPR-007 Milestone 7._
