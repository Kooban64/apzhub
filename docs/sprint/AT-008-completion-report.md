# AT-008 — Completion Report

> **Story:** AT-008 — Activity Service  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-009**

---

## Objective

Implement the Activity Service — store immutable ActivityDocument instances in an in-memory session store and expose timeline read APIs. No Event Bus, UI, React hydration, persistence, or user state.

---

## Acceptance criteria

| Criterion                                        | Status |
| ------------------------------------------------ | ------ |
| `DefaultActivityService`                         | ✅     |
| In-memory session store                          | ✅     |
| `addActivities()`                                | ✅     |
| `listActivities()`                               | ✅     |
| `getActivity()`                                  | ✅     |
| `queryTimeline()`                                | ✅     |
| `clearActivities()`                              | ✅     |
| Service diagnostics                              | ✅     |
| DI defaults to `DefaultActivityService`          | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "service"` | ✅     |
| ActivityDocument immutability preserved          | ✅     |
| No user state on documents                       | ✅     |
| Quality gates pass                               | ✅     |

---

## Architectural rule (enforced)

**ActivityDocument remains immutable.** Viewed, pinned, hidden, archived, and dismissed state are not stored on documents or mutated by the service — deferred to a future session/user state model.

---

## Deliverables

| Artifact                    | Path                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| ActivityService interface   | `src/service/activity-service.ts`                                                                      |
| DefaultActivityService      | `src/service/default-activity-service.ts`                                                              |
| ActivitySessionStore        | `src/service/activity-session-store.ts`                                                                |
| DefaultActivitySessionStore | `src/service/default-activity-session-store.ts`                                                        |
| Activity Service spec       | [SPR-007-ATF-activity-service.md](../specs/SPR-007-ATF-activity-service.md) (updated)                  |
| Session store doc           | [ACTIVITY-SESSION-STORE.md](../../packages/activity-timeline-framework/docs/ACTIVITY-SESSION-STORE.md) |
| Timeline query doc          | [TIMELINE-QUERY.md](../../packages/activity-timeline-framework/docs/TIMELINE-QUERY.md)                 |

---

## API summary

```typescript
const service = createDefaultActivityService();
service.addActivities(mapper.map(envelope).documents);
service.listActivities({ timelineScope, category, activityTypeId, limit });
service.queryTimeline({ scopeId, category, activityTypeId, limit });
service.getActivity(activityId);
service.clearActivities();
service.getDiagnostics();
```

---

## Diagnostics

| Field                     | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `status`                  | `empty` · `ready` · `scaffold` (placeholder only) |
| `totalActivityCount`      | Stored activity count                             |
| `scopeCounts`             | Count by `timelineScope`                          |
| `categoryCounts`          | Count by activity category                        |
| `latestActivityTimestamp` | Newest stored timestamp                           |
| `message`                 | Human-readable status                             |

---

## Test results

| Suite           | Result                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| ATF unit tests  | ✅ 136 passed (17 files)                                                                          |
| Service tests   | ✅ 9 new tests (add, duplicate, list, filters, ordering, query, clear, diagnostics, immutability) |
| Full unit suite | ✅ (quality gate)                                                                                 |
| Coverage        | ✅ ATF ≥80%                                                                                       |
| E2E             | ✅ 30 passed                                                                                      |

---

## Technical debt

| Item                                        | Notes                                                      |
| ------------------------------------------- | ---------------------------------------------------------- |
| User state (`viewed`, pinned, etc.)         | Deferred — separate session state model per ADR-0034       |
| `subscribe()` listeners                     | Deferred to AT-009 React hydration                         |
| Store capacity / eviction (500 cap in spec) | Not implemented — unbounded session store for AT-008       |
| Persistence                                 | Session-only — M8+                                         |
| Mapper → service wiring                     | Explicit `addActivities()` caller — no Event Bus in AT-008 |
| Hydration seeding                           | `createActivityServiceFromHydration()` deferred to AT-009  |

---

## Recommendation for AT-009

1. Implement client hydration — `createActivityTimelineContextFromDto()` and React providers
2. Build `ActivityTimelineHydrationBundle` server DTO assembly
3. Wire permission-filtered registry DTOs from AT-006 into client read-only context
4. Add `subscribe()` for `useSyncExternalStore` when presentation layer needs live updates
5. Keep user state out of ActivityDocument — introduce separate session state if viewed tracking is needed in UI

---

## Stop condition

**AT-008 complete.** Await owner approval before AT-009 (client hydration).

---

_AT-008 Completion Report — SPR-007 Milestone 7._
