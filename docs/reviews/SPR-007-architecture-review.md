# SPR-007 — Architecture Review

> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Review date:** 2026-07-05  
> **Scope:** AT-001 through AT-015 (Activity & Timeline Framework delivery)  
> **Recommendation:** **Approve Milestone 7 production readiness review (AT-016)** — proceed when instructed

---

## Executive summary

SPR-007 delivers `@apzhub/activity-timeline-framework` as the APZHUB unified activity and timeline platform layer. The Activity Registry, Timeline Registry, Event-to-Activity mapper, Activity Service, Presentation Layer, Timeline Experiences, and Context Panel integration wire into `apps/web` bootstrap without introducing a parallel execution pipeline or conflating activity with notifications.

Application wiring completes the path from successful action execution to Context Panel timeline items in parallel with existing notification badge and panel updates. E2E verification (AT-014) confirms health diagnostics, provider bootstrap, Event Bus fan-out, and action delegation.

**Overall architectural verdict:** **APPROVED WITH OBSERVATIONS**

Observations are documented limitations (session-scoped store, no live subscriptions, no user state, E2E presentation refresh hook) scoped to future milestones — not architectural violations. **No redesign is recommended.**

---

## Layering compliance

| Layer                       | Verdict | Notes                                                    |
| --------------------------- | ------- | -------------------------------------------------------- |
| Activity Registry           | ✅      | Server-authoritative; DTO filter                         |
| Timeline Registry           | ✅      | Scope descriptors; DTO filter                            |
| Activity Mapping            | ✅      | Subscribes only; never publishes                         |
| Activity Service            | ✅      | Session store; public `ActivityTimelineService` boundary |
| Activity Presentation Layer | ✅      | Pure transforms; no service mutation                     |
| Timeline Experiences        | ✅      | Consume presentation hook only                           |
| Context Panel shell         | ✅      | Composer wraps ATF; no duplicate grouping                |

Canonical stack enforced:

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences → Context Panel
```

Experiences do not import Event Bus, mapper, or registry internals in production paths.

---

## Registry reuse

**Verdict:** ✅ Approved

| Pattern                   | Assessment                                                |
| ------------------------- | --------------------------------------------------------- |
| Activity Registry Pattern | Catalogue + manifest → bootstrap → filter → DTO           |
| Timeline Registry Pattern | Parallel bootstrap; independent registry                  |
| Hydration bundle          | `buildActivityTimelineHydrationBundle()` — metadata only  |
| Permission filtering      | Server-side DTO filter before client hydration            |
| Health reporting          | `/api/health` `activities` + `timelines` mirror hydration |

**Observation:** Health loaders call `loadSharedActivityTimelineContext()` independently — acceptable; shared cache optimisation deferred.

**Observation:** Client `ActivityTimelineService` wraps same `DefaultActivityService` instance as server-side mapper subscriber in client session — by design for M7 in-process shell.

---

## Event separation

**Verdict:** ✅ Approved

| Rule                                  | Compliance                                         |
| ------------------------------------- | -------------------------------------------------- |
| Activity consumes events              | ✅ `wireAppActivityTimeline()` subscriber          |
| Activity never publishes              | ✅ No `publish()` in ATF activity modules          |
| Modules never write activity directly | ✅ No public `recordActivity()` on capabilities    |
| UI never imports Event Bus            | ✅ Experiences use presentation hooks              |
| Activity ≠ Notification               | ✅ Separate mappers, services, stores, Experiences |

Parallel fan-out on `capability.action.executed` verified in unit, integration, and E2E tests.

---

## Activity / notification separation

**Verdict:** ✅ Approved

| Concern               | Activity owner               | Notification owner         |
| --------------------- | ---------------------------- | -------------------------- |
| Type / route metadata | ActivityRegistry             | NotificationRegistry       |
| Event → item mapping  | DefaultEventToActivityMapper | DefaultNotificationMapper  |
| Session storage       | DefaultActivityService       | DefaultNotificationService |
| Public client API     | ActivityTimelineService      | NotificationService        |
| View models           | Activity Presentation        | Notification Presentation  |
| Shell UI              | Context Panel Timeline       | Badge + Panel              |

No cross-service writes. ADR-0035 enforced.

---

## Execution pipeline

**Verdict:** ✅ Approved — reuses Action Framework pipeline

```text
Shell / E2E hook
  → DefaultActionExecutor.execute()
  → createActionAuditEventBusHook → Event Bus.publish()
  → wireAppActivityTimeline subscriber (parallel to wireAppEventNotifications)
  → DefaultEventToActivityMapper.map()
  → DefaultActivityService.addActivities()
  → useActivityPresentation() → Context Panel Timeline
```

| ADR / Rule                     | Compliance                             |
| ------------------------------ | -------------------------------------- |
| ADR-0033 unified package       | ✅ index, server, react exports        |
| ADR-0034 registry model        | ✅ Activity + Timeline registries      |
| ADR-0035 execution routing     | ✅ Shared Event Bus; no new pipeline   |
| Document 000 §6.1 API layering | ✅ Runtime → frameworks → app wiring   |
| No Experience → Event Bus      | ✅ Enforced via Service + Presentation |
| Baseline v1.0 frozen           | ✅ No baseline document edits          |

---

## Context Panel integration

**Verdict:** ✅ Approved

| Requirement                                              | Assessment                   |
| -------------------------------------------------------- | ---------------------------- |
| Independent Workbench Experience                         | ✅ Not notification history  |
| `enableActivityTimeline` / `enableActivityTimelinePanel` | ✅ DesktopShell flags        |
| Activity tab registration                                | ✅ `WorkbenchContextPanel`   |
| Consumes `WorkbenchActivityTimeline`                     | ✅ No duplicate presentation |
| No Workbench Manager redesign                            | ✅ Additive shell region     |

**Observation:** Context Panel does not integrate Workbench Context Engine `setContext` — structural tab only (TD-M7-01).

---

## Diagnostics and E2E hooks

**Verdict:** ✅ Approved with observations

| Mechanism                               | Assessment                                    |
| --------------------------------------- | --------------------------------------------- |
| `ActivityTimelineDiagnostics`           | Hidden; production guard                      |
| Experience diagnostics testid           | Hidden marker for E2E                         |
| `__APZHUB_E2E__` activity hooks         | Env-gated; test infrastructure only           |
| `refreshActivityTimelinePresentation()` | E2E workaround for missing live subscriptions |

**Observation:** E2E refresh hook is acceptable test infrastructure until live subscriptions land — must not be used in production paths (gated by `NEXT_PUBLIC_E2E_TEST_HOOKS`).

---

## ADR compliance summary

| ADR      | Title                                 | Verdict |
| -------- | ------------------------------------- | ------- |
| ADR-0033 | Activity & Timeline Framework Package | ✅      |
| ADR-0034 | Activity Registry and Timeline Model  | ✅      |
| ADR-0035 | Activity Execution Routing            | ✅      |

---

## Observations register

| ID        | Observation                                              | Severity | Target                         |
| --------- | -------------------------------------------------------- | -------- | ------------------------------ |
| OBS-AT-01 | No live subscriptions — timeline UI static until remount | Medium   | Post-M7 enhancement            |
| OBS-AT-02 | No user state (viewed/unread)                            | Medium   | M8+                            |
| OBS-AT-03 | Session-scoped store only                                | Medium   | M8+ persistence                |
| OBS-AT-04 | Mapper does not populate `actionRef` from audit payload  | Low      | Template enhancement           |
| OBS-AT-05 | Context Panel not wired to Context Engine                | Low      | Workbench UX polish            |
| OBS-AT-06 | E2E presentation refresh hook                            | Low      | Remove when OBS-AT-01 resolved |
| OBS-AT-07 | No search/filter UI                                      | Low      | Product story                  |

None of the above require architectural redesign before Milestone 7 closeout.

---

## Verdict

**APPROVED WITH OBSERVATIONS**

Milestone 7 Activity & Timeline Framework architecture is compliant with Platform 4.0 extension patterns, ADRs 0033–0035, and Document 021 separation of activity from notification.

Proceed to **AT-016 Production Readiness Review** when authorised.

---

_SPR-007 Architecture Review — AT-015._
