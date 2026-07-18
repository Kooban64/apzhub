# AT-010 — Completion Report

> **Story:** AT-010 — Activity Timeline Service  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-011**

---

## Objective

Establish the public Activity Timeline Service as the stable client-facing API — mirroring Knowledge Framework service evolution. No Timeline UI, presentation layer, DesktopShell, or apps/web wiring.

---

## Acceptance criteria

| Criterion                                            | Status |
| ---------------------------------------------------- | ------ |
| `ActivityTimelineService` interface                  | ✅     |
| `DefaultActivityTimelineService`                     | ✅     |
| `createActivityTimelineService()`                    | ✅     |
| `createActivityTimelineServiceFromHydration()`       | ✅     |
| `ActivityTimelineServiceProvider`                    | ✅     |
| `useActivityService()`                               | ✅     |
| Service diagnostics                                  | ✅     |
| Delegates to internal Activity Service               | ✅     |
| No public mutation APIs                              | ✅     |
| `ActivityTimelineProvider` unchanged (metadata only) | ✅     |
| `ACTIVITY_TIMELINE_REACT_STATUS = "service"`         | ✅     |
| Quality gates pass                                   | ✅     |

---

## Architectural rule (enforced)

**Experiences must never consume `DefaultActivityService` directly.** They consume `ActivityTimelineService` through `useActivityService()`. Internal runtime storage remains server/mapper owned.

---

## Deliverables

| Artifact                       | Path                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Activity Timeline Service spec | [SPR-007-ATF-activity-timeline-service.md](../specs/SPR-007-ATF-activity-timeline-service.md) |
| React service API doc          | [REACT-SERVICE-API.md](../../packages/activity-timeline-framework/docs/REACT-SERVICE-API.md)  |
| Public service interface       | `src/client/service/activity-timeline-service.ts`                                             |
| Default implementation         | `src/client/service/default-activity-timeline-service.ts`                                     |
| React provider + hook          | `src/react/activity-timeline-service-context.tsx`, `use-activity-service.ts`                  |

---

## API summary

```typescript
const service = createActivityTimelineService({ registryReady: true });
service.listActivities({ timelineScope: "timeline.personal" });
service.queryTimeline({ scopeId: "timeline.personal" });
service.getActivity(activityId);
service.getDiagnostics();

<ActivityTimelineProvider bundle={bundle}>
  <ActivityTimelineServiceProvider>
    <Experience />
  </ActivityTimelineServiceProvider>
</ActivityTimelineProvider>

const { listActivities, queryTimeline, diagnostics } = useActivityService();
```

---

## Diagnostics

| Field                     | Description                       |
| ------------------------- | --------------------------------- |
| `serviceStatus`           | `ready` · `empty` · `unavailable` |
| `registryStatus`          | Activity client registry status   |
| `timelineRegistryStatus`  | Timeline client registry status   |
| `activityCount`           | Stored activities                 |
| `timelineDefinitionCount` | Hydrated timeline definitions     |
| `hydrationStatus`         | Combined hydration state          |

---

## Test results

| Suite            | Result                                                     |
| ---------------- | ---------------------------------------------------------- |
| Service tests    | ✅ 8 new tests (delegation, empty, diagnostics, hydration) |
| React hook tests | ✅ 4 new tests                                             |
| ATF unit tests   | ✅ (quality gate)                                          |
| Full unit suite  | ✅ (quality gate)                                          |
| Coverage         | ✅ ATF ≥80%                                                |
| E2E              | ✅ 30 passed                                               |

---

## Technical debt

| Item                                                         | Notes                               |
| ------------------------------------------------------------ | ----------------------------------- |
| Presentation layer (`useActivityPresentation`)               | Deferred — AT-011                   |
| Timeline UI / experiences                                    | Deferred — AT-012+                  |
| apps/web provider wiring                                     | Deferred — AT-013                   |
| `buildActivityTimelineHydrationDto()` with activity snapshot | Deferred — server bootstrap         |
| `subscribe()` / live updates                                 | Deferred — presentation/integration |
| User state (viewed, pinned)                                  | Separate session state model        |
| Event Bus → service wiring                                   | Server/runtime — not client scope   |

---

## Recommendation for AT-011

1. Implement Activity Presentation Layer — view models, grouping, timestamp formatting
2. Add `useActivityPresentation()` as the mandatory experience hook above raw documents
3. Keep experiences on `useActivityService()` for data — presentation for display shape only
4. Do not expose `DefaultActivityService` or raw store mutation paths
5. Defer Timeline UI components until presentation layer is stable

---

## Stop condition

**AT-010 complete.** Await owner approval before AT-011 (Presentation Layer).

---

_AT-010 Completion Report — SPR-007 Milestone 7._
