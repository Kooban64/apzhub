# SPR-007 — Sprint Closeout Report

> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Milestone:** 7 — Activity & Timeline Framework  
> **Date:** 2026-07-05  
> **Status:** Complete — **awaiting owner approval before tag and Milestone 8 planning**

---

## Executive summary

SPR-007 delivered `@apzhub/activity-timeline-framework` — the APZHUB unified activity and timeline platform layer. Sixteen sequential stories (AT-001–AT-016) implemented the Activity Registry, Timeline Registry, manifest bootstrap, permission-filtered DTO hydration, Event-to-Activity Mapper, Activity Service, Activity Presentation Layer, Timeline Experiences, Context Panel integration, application wiring, E2E verification, documentation, production readiness review, and formal closeout.

The framework integrates with the shared Event Bus and Action Framework audit hook without a parallel execution pipeline. Successful actions publish `capability.action.executed`; activity types map to timeline items surfaced in the Context Panel Activity tab while notifications continue in parallel.

**Recommended release tag:** `v0.7.0-activity-timeline-framework` (do **not** create until owner instructs).

---

## Story summary (AT-001 – AT-016)

| Story  | Title                                                  | Status |
| ------ | ------------------------------------------------------ | ------ |
| AT-001 | Activity & Timeline Architecture                       | ✅     |
| AT-002 | Package scaffold                                       | ✅     |
| AT-003 | Activity Registry core                                 | ✅     |
| AT-004 | Timeline model & registry                              | ✅     |
| AT-005 | Manifest bootstrap                                     | ✅     |
| AT-006 | Server filter DTO                                      | ✅     |
| AT-007 | Activity Mapping subscriber                            | ✅     |
| AT-008 | Activity Service API                                   | ✅     |
| AT-009 | Client hydration + hooks                               | ✅     |
| AT-010 | Activity Presentation Layer                            | ✅     |
| AT-011 | Timeline Experiences                                   | ✅     |
| AT-012 | Context Panel integration                              | ✅     |
| AT-013 | Application integration (`apps/web`)                   | ✅     |
| AT-014 | E2E verification                                       | ✅     |
| AT-015 | Documentation & governance                             | ✅     |
| AT-016 | Production readiness review & closeout (this document) | ✅     |

**Note:** Architecture review (originally AT-017) delivered in AT-015. Sprint closeout (originally AT-018) consolidated into AT-016 per owner scope.

**Package status:** `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "experiences"`.

---

## Milestone deliverables

| Subsystem                | Deliverable                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Activity Registry        | Catalogue + manifest bootstrap, conflict diagnostics                                                   |
| Timeline Registry        | Scope descriptors, personal/team/workspace/system model                                                |
| Bootstrap                | `bootstrapActivityRegistry()`, `bootstrapTimelineRegistry()`                                           |
| DTO hydration            | `filterActivityRegistryDto()`, `filterTimelineRegistryDto()`, `buildActivityTimelineHydrationBundle()` |
| Event-to-Activity Mapper | `DefaultEventToActivityMapper` — parallel Event Bus subscriber                                         |
| Activity Service         | `DefaultActivityService`, `ActivityTimelineService`, session store                                     |
| Presentation Layer       | View models, date grouping, relative timestamps                                                        |
| Timeline Experiences     | `ActivityTimelineExperience`, `WorkbenchActivityTimeline`                                              |
| apps/web integration     | Context factory, wire, hydration, health, providers                                                    |
| Context Panel            | Activity tab via `enableActivityTimelinePanel`                                                         |
| E2E verification         | `spr-007-activity-timeline-framework.spec.ts` (6 scenarios)                                            |
| Documentation            | Architecture, onboarding, governance, reviews                                                          |

---

## Architecture

### Canonical pipeline

```text
Platform Capability
        ↓
Domain Event
        ↓
Event Bus
        ↓
Activity Mapping
        ↓
Activity Service
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences
        ↓
Context Panel
```

Public client boundaries: **`useActivityService()`** (internal hooks) and **`useActivityTimelineExperienceDiagnostics()`** (Experiences).

Reference: [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)

### Compliance

| Rule / ADR                                            | Result |
| ----------------------------------------------------- | ------ |
| ADR-0033 Package boundaries                           | ✅     |
| ADR-0034 Activity & Timeline registries               | ✅     |
| ADR-0035 Execution routing                            | ✅     |
| Activity / notification separation                    | ✅     |
| Registry Pattern — server authority, client read-only | ✅     |
| No business modules                                   | ✅     |
| Baseline v1.0 frozen                                  | ✅     |

See [SPR-007 architecture review](../reviews/SPR-007-architecture-review.md).

---

## Engineering statistics

| Metric               | Value (AT-016 closeout)               |
| -------------------- | ------------------------------------- |
| Sprint stories       | 16 (AT-001–AT-016)                    |
| Unit/component tests | **1308** (238 files)                  |
| E2E tests            | **36** (+6 spr-007)                   |
| Statement coverage   | **90.58%**                            |
| Branch coverage      | 86.91%                                |
| Function coverage    | 91.58%                                |
| ADRs accepted        | 0033–0035                             |
| Spec documents       | 20+ SPR-007 specs + architecture docs |
| Completion reports   | 16 (AT-001–AT-016)                    |

---

## Quality gates

All gates passed at AT-016 closeout (2026-07-05):

| Gate                 | Result                      |
| -------------------- | --------------------------- |
| `pnpm lint`          | ✅ Pass                     |
| `pnpm typecheck`     | ✅ Pass                     |
| `pnpm build`         | ✅ Pass                     |
| `pnpm test`          | ✅ Pass — 1308 tests        |
| `pnpm test:coverage` | ✅ Pass — 90.58% statements |
| `pnpm test:e2e`      | ✅ Pass — 36 E2E tests      |

---

## Testing

| Layer                                                    | Coverage                                            |
| -------------------------------------------------------- | --------------------------------------------------- |
| Activity / Timeline registries, bootstrap, DTO           | Unit                                                |
| Activity Mapper, templates                               | Unit                                                |
| Activity Service, session store                          | Unit                                                |
| Presentation layer, grouping                             | Unit                                                |
| Timeline Experiences, Context Panel                      | Component                                           |
| App wiring, health, mapper wire                          | Integration                                         |
| Health, Context Panel, pipeline, delegation, diagnostics | E2E (`spr-007-activity-timeline-framework.spec.ts`) |

E2E scenarios: health `activities`/`timelines`, provider bootstrap, Context Panel Activity tab, action → timeline + parallel notifications, actionRef delegation, diagnostics guard.

---

## Documentation

| Document              | Path                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Combined architecture | [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)                                      |
| Developer onboarding  | [activity-timeline-onboarding.md](../developer/activity-timeline-onboarding.md)                                       |
| Architecture review   | [SPR-007-architecture-review.md](../reviews/SPR-007-architecture-review.md)                                           |
| Production readiness  | [MILESTONE-007-production-readiness.md](../reviews/MILESTONE-007-production-readiness.md)                             |
| Milestone review      | [MILESTONE-007-activity-timeline-framework-review.md](../reviews/MILESTONE-007-activity-timeline-framework-review.md) |
| Release notes         | [v0.7.0-activity-timeline-framework.md](../releases/v0.7.0-activity-timeline-framework.md)                            |
| Spec index            | [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md)                                                               |

---

## Consolidated technical debt

| ID         | Item                                   | Target                               |
| ---------- | -------------------------------------- | ------------------------------------ |
| TD-AT15-01 | Live subscriptions deferred            | Post-M7 — remove E2E refresh hook    |
| TD-AT15-02 | User state (viewed/unread)             | M8+                                  |
| TD-AT15-03 | Persistent activity store              | M8+                                  |
| TD-AT15-04 | Context Panel ↔ Context Engine         | Workbench UX polish                  |
| TD-AT15-05 | E2E presentation refresh hook          | Test-only; remove with subscriptions |
| TD-AT15-06 | Mapper `actionRef` from audit payload  | Template enhancement                 |
| TD-AT15-07 | Search / filter UI                     | Product story                        |
| TD-M8-RBAC | Full RBAC population from auth session | Milestone 8                          |

---

## Deferred work

| Item                         | Notes                                  |
| ---------------------------- | -------------------------------------- |
| User state (viewed/unread)   | Service + presentation affordances M8+ |
| Live subscriptions           | Timeline UI static until remount       |
| Persistent activity store    | Session-scoped only                    |
| Search and filtering UI      | Experience layer product story         |
| Event replay                 | Requires event store M10+              |
| Team timeline RBAC depth     | Scope model stub exists                |
| External Event Bus transport | In-process only                        |

---

## Recommended release

**Tag:** `v0.7.0-activity-timeline-framework`  
**Baseline:** `v0.6.0-event-notification-framework`

Do **not** create the Git tag until owner instructs.

---

## Recommendation for Milestone 8

**Planning only — do not implement.**

Per [Platform Roadmap](../architecture/platform-roadmap.md), Milestone 8 is **Identity & Administration**. Recommended next steps for owners:

1. Approve Milestone 7 closeout and optional `v0.7.0-activity-timeline-framework` tag
2. Author Sprint 008 backlog from Documents 007 and 023
3. Integrate PermissionService with Workbench Manager and registry filtering
4. Deliver administration workspace scaffold and preferences persistence
5. Defer activity persistence and delivery service to M8+ stories as scoped

Do **not** begin Sprint 008 implementation until owner approves Milestone 7 closeout.

---

## Stop condition

**Do not plan or implement Milestone 8** until owner approves this closeout.

---

_SPR-007 Sprint Closeout — Activity & Timeline Framework._
