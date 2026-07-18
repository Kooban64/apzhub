# AT-009 — Completion Report

> **Story:** AT-009 — Client Hydration  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-010**

---

## Objective

Implement client hydration for the Activity & Timeline Framework — read-only metadata registries from server DTOs, React providers, and hydration diagnostics. Mirror ENF/KDF/Action hydration architecture. No Event Bus, presentation, UI, application wiring, or ActivityDocument hydration.

---

## Acceptance criteria

| Criterion                                          | Status |
| -------------------------------------------------- | ------ |
| `createActivityRegistryFromDto()`                  | ✅     |
| `createTimelineRegistryFromDto()`                  | ✅     |
| Read-only client registries                        | ✅     |
| `ActivityTimelineProvider`                         | ✅     |
| `useActivityRegistry()`                            | ✅     |
| `useTimelineRegistry()`                            | ✅     |
| `useActivityTimelineContext()`                     | ✅     |
| Hydration diagnostics                              | ✅     |
| `createActivityTimelineContextFromDto()`           | ✅     |
| `ACTIVITY_TIMELINE_REACT_STATUS = "hydration"`     | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "hydration"` | ✅     |
| No ActivityDocument hydration                      | ✅     |
| No client registration APIs                        | ✅     |
| Quality gates pass                                 | ✅     |

---

## Architectural rule (enforced)

**Client registries are read-only.** No `register`, `registerMany`, or `clear`. Activity Service remains server/runtime owned — only metadata registries are hydrated. User state and ActivityDocuments deferred.

---

## Deliverables

| Artifact                   | Path                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Client hydration factories | `src/client/`                                                                                 |
| React provider + hooks     | `src/react/`                                                                                  |
| Client hydration spec      | [CLIENT-HYDRATION.md](../../packages/activity-timeline-framework/docs/CLIENT-HYDRATION.md)    |
| React API doc              | [REACT-API.md](../../packages/activity-timeline-framework/docs/REACT-API.md)                  |
| Updated specification      | [SPR-007-ATF-activity-client-hydration.md](../specs/SPR-007-ATF-activity-client-hydration.md) |

---

## API summary

```typescript
const context = createActivityTimelineContextFromDto(bundle);
context.activityRegistry.list();
context.timelineRegistry.listByScope("timeline.personal");
context.diagnostics.hydrationStatus;

<ActivityTimelineProvider bundle={bundle}>
  <Consumer />
</ActivityTimelineProvider>

useActivityRegistry();      // metadata only
useTimelineRegistry();      // metadata only
useActivityTimelineContext(); // combined diagnostics
```

---

## Hydration diagnostics

| Field                     | Description                      |
| ------------------------- | -------------------------------- |
| `hydrationStatus`         | `empty` · `hydrated` · `invalid` |
| `activityRegistryStatus`  | Activity client registry status  |
| `timelineRegistryStatus`  | Timeline client registry status  |
| `schemaVersion`           | Bundle schema version (`1`)      |
| `frameworkVersion`        | Platform catalogue stamp         |
| `activityTypeCount`       | Hydrated activity type count     |
| `timelineDefinitionCount` | Hydrated timeline count          |

Per-registry: `ClientActivityRegistryDiagnostics`, `ClientTimelineRegistryDiagnostics`.

---

## Test results

| Suite                  | Result            |
| ---------------------- | ----------------- |
| Client hydration tests | ✅ 17 new tests   |
| React hook tests       | ✅ 11 new tests   |
| ATF unit tests         | ✅ (quality gate) |
| Full unit suite        | ✅ (quality gate) |
| Coverage               | ✅ ATF ≥80%       |
| E2E                    | ✅ 30 passed      |

---

## Technical debt

| Item                                                  | Notes                                  |
| ----------------------------------------------------- | -------------------------------------- |
| `buildActivityTimelineHydrationDto()` server assembly | Deferred — apps/web bootstrap (AT-013) |
| ActivityDocument / service client hydration           | Deferred — AT-010+                     |
| `useActivityService()` React hook                     | Deferred — AT-010+                     |
| `subscribe()` / live updates                          | Deferred — presentation/integration    |
| User state (viewed, pinned)                           | Separate session state model           |
| apps/web provider wiring                              | Deferred — AT-013                      |
| Presentation layer                                    | Deferred — AT-011+                     |
| Timeline UI / experiences                             | Deferred — AT-012+                     |

---

## Recommendation for AT-010

1. Define client Activity Service boundary — read-only query hooks or server-proxied mutations (architecture decision)
2. Implement `useActivityService()` when client can safely access session-scoped activity reads
3. Add `buildActivityTimelineHydrationDto()` server bundle assembly (metadata + optional activity snapshot when approved)
4. Consider `subscribe()` for `useSyncExternalStore` when timeline experiences need live updates
5. Keep ActivityDocument immutability and user state separation per ADR-0034

---

## Stop condition

**AT-009 complete.** Await owner approval before AT-010.

---

_AT-009 Completion Report — SPR-007 Milestone 7._
