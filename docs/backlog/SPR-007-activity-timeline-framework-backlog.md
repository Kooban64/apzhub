# SPR-007 — Activity & Timeline Framework Engineering Backlog

> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Milestone:** 7 — Activity & Timeline Framework  
> **Mode:** Milestone 7 complete — **await owner approval before Milestone 8 planning**  
> **Authority:** [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md) · [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Platform 4.0](../releases/APZHUB-Platform-v4.0.md) · [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md)

---

## Development workflow

Architecture redesign is not permitted. All stories extend Platform 4.0. Baseline changes require ADR.

```text
Product Requirement (Documents 021, 012, 029)
        ↓
Technical Specification
        ↓
Implementation
        ↓
Code Review
        ↓
Merge
        ↓
Release
```

### Story process

1. Technical Specification — `docs/specs/` or story appendix
2. Implementation — single PR, single concern
3. Tests — unit / integration / E2E per story
4. Documentation — guides, CHANGELOG if user-visible
5. Review — baseline + acceptance criteria
6. Close — completion report; owner review; next story

**Rule:** Complete one story before beginning the next.

### Effort scale

| Label | Estimate  |
| ----- | --------- |
| S     | 0.5–1 day |
| M     | 1–2 days  |
| L     | 2–3 days  |

---

## Activity & Timeline Framework vision

The Activity & Timeline Framework provides **unified activity recording and timeline presentation** from platform events. Modules publish events; the platform maps events to activity items and presents them in permission-filtered timelines.

| Capability                                     | Sprint scope                  |
| ---------------------------------------------- | ----------------------------- |
| Activity manifest (`activities:` block)        | ✅ Foundation                 |
| Timeline manifest (`timelines:` block)         | ✅ Foundation                 |
| Activity Registry                              | ✅ Foundation                 |
| Timeline Registry                              | ✅ Foundation                 |
| Event-to-activity mapper (parallel subscriber) | ✅ Foundation                 |
| Activity Service API                           | ✅ Public boundary            |
| Personal timeline (Context Panel)              | ✅ Experience                 |
| Workspace activity feed                        | ✅ Scaffold                   |
| Real-time WebSocket/SSE                        | ⏳ Interface stub             |
| Persistent activity store                      | ⏳ Interface stub             |
| Audit framework                                | ⏳ Out of scope — not SPR-007 |
| Notification routing                           | ⏳ Independent — M6 unchanged |
| Team subscription service                      | ⏳ Registry scaffold          |

**Constraint:** Modules never write activity records directly ([Document 021 §3](../021-notification-activity-attention-management-framework.md)). Activity Mapping is a **parallel Event Bus subscriber** — not an extension of the Notification Framework.

---

## Story map

```text
AT-001 Activity & Timeline Architecture
    ↓
AT-002 Package scaffold
    ↓
AT-003 Activity Registry core ── AT-004 Timeline model & registry
    ↓
AT-005 Manifest bootstrap
    ↓
AT-006 Server filter DTO
    ↓
AT-007 Activity Mapping subscriber
    ↓
AT-008 Activity Service API
    ↓
AT-009 Client hydration + hooks
    ↓
AT-010 Activity Presentation Layer ── AT-011 Timeline Experiences
    ↓
AT-012 Context Panel integration
    ↓
AT-013 Application integration (apps/web)
    ↓
AT-014 E2E tests
    ↓
AT-015 Documentation & governance
    ↓
AT-016 Production readiness review
    ↓
AT-017 Architecture review preparation
    ↓
AT-018 Sprint closeout
```

---

## AT-001 — Activity & Timeline Architecture

| Field                | Value                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-001                                                                                                                                                                                   |
| **Objective**        | Authorise Sprint 007 through accepted ADRs and story-level technical specifications                                                                                                      |
| **Scope**            | Package boundary ADR; Activity Registry model ADR; Timeline model ADR; Event-to-activity mapping ADR; manifest schema proposals; `SPR-007-spec-index.md`; subsystem architecture outline |
| **Out of scope**     | Production code; Runtime/Workbench/Action/Knowledge/ENF changes                                                                                                                          |
| **Deliverables**     | ADR-0033 (package), ADR-0034 (Activity Registry & mapping), ADR-0035 (Timeline model); spec index; architecture outline for `activity-timeline-framework.md`                             |
| **Tests**            | N/A (documentation gate)                                                                                                                                                                 |
| **Dependencies**     | Platform 4.0 approved; SPR-007 sprint guide; M6 closeout owner approval                                                                                                                  |
| **Estimated effort** | M                                                                                                                                                                                        |

### Acceptance criteria

- [x] ADR-0033 accepted — package name `@apzhub/activity-timeline-framework`, export structure
- [x] ADR-0034 accepted — Activity Registry, Event-to-activity mapper as parallel subscriber, consumer-only posture
- [x] ADR-0035 accepted — Timeline Registry, scope model, Context Panel integration approach
- [x] Spec index lists AT-002–AT-018 specifications
- [x] Activity taxonomy — Personal, Team, Workspace, System with examples
- [x] Timeline taxonomy — personal, team, workspace, system scopes documented
- [x] Explicit boundary — not audit, not notification, not event store
- [x] Architecture review recorded for AT-002 start — see [AT-001-completion-report.md](../sprint/AT-001-completion-report.md)

---

## AT-002 — Package scaffold

| Field                | Value                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-002                                                                                                                                                                 |
| **Objective**        | Create `@apzhub/activity-timeline-framework` package skeleton with exports, types, and quality gate wiring                                                             |
| **Scope**            | `package.json`, `tsconfig`, ESLint, Vitest config, empty barrel exports (`index`, `server`, `react`), monorepo workspace registration, `transpilePackages` in apps/web |
| **Out of scope**     | Registry implementation; UI; bootstrap                                                                                                                                 |
| **Deliverables**     | Package scaffold; README stub; status constant `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "scaffold"`                                                                       |
| **Tests**            | Smoke test — package imports resolve                                                                                                                                   |
| **Dependencies**     | AT-001 ADRs accepted                                                                                                                                                   |
| **Estimated effort** | S                                                                                                                                                                      |

---

## AT-003 — Activity Registry core

| Field                | Value                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-003                                                                                                                                        |
| **Objective**        | Implement server-side Activity Registry with registration, lookup, and conflict diagnostics                                                   |
| **Scope**            | `ActivityRegistry` class; `registerActivityType()`, `getActivityType()`, `listActivityTypes()`; duplicate detection; readonly snapshot export |
| **Out of scope**     | Manifest extraction; client hydration; event mapping                                                                                          |
| **Deliverables**     | `server/registry/activity-registry.ts`; unit tests                                                                                            |
| **Tests**            | Unit — register, duplicate, list, diagnostics                                                                                                 |
| **Dependencies**     | AT-002                                                                                                                                        |
| **Estimated effort** | M                                                                                                                                             |

---

## AT-004 — Timeline model & registry

| Field                | Value                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | AT-004                                                                                                                                                 |
| **Objective**        | Implement Timeline Registry with scope model (personal, team, workspace, system)                                                                       |
| **Scope**            | `TimelineRegistry`; `TimelineScope` enum; `registerTimeline()`, `getTimeline()`, `listTimelines()`; activity type filter binding; conflict diagnostics |
| **Out of scope**     | UI; hydration; activity store                                                                                                                          |
| **Deliverables**     | `server/registry/timeline-registry.ts`; timeline scope types; unit tests                                                                               |
| **Tests**            | Unit — register timeline, scope filter, duplicate, list by scope                                                                                       |
| **Dependencies**     | AT-002                                                                                                                                                 |
| **Estimated effort** | M                                                                                                                                                      |

---

## AT-005 — Manifest bootstrap

| Field                | Value                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-005                                                                                                                                                                                                              |
| **Objective**        | Bootstrap Activity and Timeline registries from capability manifests and platform catalogues                                                                                                                        |
| **Scope**            | `bootstrapActivityRegistry()`; `bootstrapTimelineRegistry()`; manifest `activities` and `timelines` block extraction (ADR schema); `PlatformActivityCatalogueProvider`; integration with Runtime manifest discovery |
| **Out of scope**     | Event mapping; client hydration                                                                                                                                                                                     |
| **Deliverables**     | `server/bootstrap/bootstrap-activity-registry.ts`; `server/bootstrap/bootstrap-timeline-registry.ts`; platform catalogues; integration test with fixture manifests                                                  |
| **Tests**            | Integration — bootstrap from test manifests; built-in catalogue registration                                                                                                                                        |
| **Dependencies**     | AT-003, AT-004                                                                                                                                                                                                      |
| **Estimated effort** | M                                                                                                                                                                                                                   |

---

## AT-006 — Server filter DTO

| Field                | Value                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-006                                                                                                                            |
| **Objective**        | Serialise permission-filtered Activity and Timeline Registry DTOs for client hydration                                            |
| **Scope**            | `ActivityRegistryDto`; `TimelineRegistryDto`; `filterActivityRegistryDto()`; `filterTimelineRegistryDto()`; hydration diagnostics |
| **Out of scope**     | Activity item DTO; client provider                                                                                                |
| **Deliverables**     | `server/filter/filter-activity-registry-dto.ts`; `server/filter/filter-timeline-registry-dto.ts`; DTO types; unit tests           |
| **Tests**            | Unit — filter strips disallowed; DTO immutability                                                                                 |
| **Dependencies**     | AT-005                                                                                                                            |
| **Estimated effort** | S                                                                                                                                 |

---

## AT-007 — Activity Mapping subscriber

| Field                | Value                                                                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-007                                                                                                                                                                                                           |
| **Objective**        | Implement Event-to-activity mapper as parallel Event Bus subscriber                                                                                                                                              |
| **Scope**            | `EventToActivityMapper`; subscribe on existing `InProcessEventBus`; in-memory activity store per session; map action audit and platform events to activity DTOs; idempotent handling; subscriber error isolation |
| **Out of scope**     | Notification mapper changes; persistent store; audit persistence                                                                                                                                                 |
| **Deliverables**     | `server/mappers/event-to-activity-mapper.ts`; `server/store/in-memory-activity-store.ts`; unit + integration tests                                                                                               |
| **Tests**            | Integration — publish event → activity created; parallel with notification mapper (no interference)                                                                                                              |
| **Dependencies**     | AT-003, AT-005; M6 Event Bus (no ENF code changes unless adapter hook ADR)                                                                                                                                       |
| **Estimated effort** | L                                                                                                                                                                                                                |

---

## AT-008 — Activity Service API

| Field                | Value                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-008                                                                                                                                                                    |
| **Objective**        | Implement public Activity Service boundary and `useActivityService()` hook                                                                                                |
| **Scope**            | `ActivityService`; `createActivityServiceFromHydration()`; `listActivities`, `getActivity`, `subscribe`, `getTimelineScopes`, `getDiagnostics`; read-only client contract |
| **Out of scope**     | Presentation mapping; shell Experiences                                                                                                                                   |
| **Deliverables**     | `react/hooks/use-activity-service.ts`; service implementation; unit tests                                                                                                 |
| **Tests**            | Unit — list by scope, get single, subscribe callback                                                                                                                      |
| **Dependencies**     | AT-007                                                                                                                                                                    |
| **Estimated effort** | M                                                                                                                                                                         |

---

## AT-009 — Client hydration + hooks

| Field                | Value                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | AT-009                                                                                                                                           |
| **Objective**        | Deliver client hydration bundle and React provider with registry hooks                                                                           |
| **Scope**            | `ActivityTimelineProvider`; `useActivityRegistry()`; `useTimelineRegistry()`; `buildActivityTimelineHydrationDto()`; read-only client registries |
| **Out of scope**     | Activity Service public API (AT-008); shell UI                                                                                                   |
| **Deliverables**     | `react/provider/`; `server/hydration/`; component tests                                                                                          |
| **Tests**            | Component — provider renders; hooks throw outside provider                                                                                       |
| **Dependencies**     | AT-006, AT-007, AT-008                                                                                                                           |
| **Estimated effort** | M                                                                                                                                                |

---

## AT-010 — Activity Presentation Layer

| Field                | Value                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-010                                                                                                                                                  |
| **Objective**        | Implement Presentation Layer helpers mapping activity DTOs to timeline view models                                                                      |
| **Scope**            | `mapActivityDtoToViewModel()`; `groupActivitiesByDate()`; relative timestamps; actor label formatting; actionRef passthrough for `execute()` delegation |
| **Out of scope**     | Shell layout; Event Bus; Context Panel wiring                                                                                                           |
| **Deliverables**     | `react/presentation/`; unit tests                                                                                                                       |
| **Tests**            | Unit — mapping, grouping, empty state                                                                                                                   |
| **Dependencies**     | AT-008                                                                                                                                                  |
| **Estimated effort** | M                                                                                                                                                       |

---

## AT-011 — Timeline Experiences

| Field                | Value                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-011                                                                                                                    |
| **Objective**        | Deliver Personal Timeline and Workspace Activity Feed Experiences                                                         |
| **Scope**            | `PersonalTimelineExperience`; `WorkspaceActivityFeedExperience`; enable flags on `DesktopShell`; empty and loading states |
| **Out of scope**     | Context Panel tab wiring (AT-012); real-time push                                                                         |
| **Deliverables**     | Experiences in activity-timeline-framework package; component tests                                                       |
| **Tests**            | Component — render list, empty state, scope label                                                                         |
| **Dependencies**     | AT-010                                                                                                                    |
| **Estimated effort** | L                                                                                                                         |

---

## AT-012 — Context Panel integration

| Field                | Value                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-012                                                                                                                                        |
| **Objective**        | Integrate Personal Timeline Experience into Workbench Context Panel activity tab                                                              |
| **Scope**            | Context Panel tab registration; `enablePersonalTimeline` flag; tab label and icon; permission-gated visibility; no Workbench Manager redesign |
| **Out of scope**     | New context panel engine; E2E (AT-014)                                                                                                        |
| **Deliverables**     | Context Panel tab wiring in workbench or apps/web (per ADR); component tests                                                                  |
| **Tests**            | Component — tab renders timeline; hidden when flag off                                                                                        |
| **Dependencies**     | AT-011                                                                                                                                        |
| **Estimated effort** | M                                                                                                                                             |

---

## AT-013 — Application integration (apps/web)

| Field                | Value                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-013                                                                                                                                                                      |
| **Objective**        | Wire Activity & Timeline Framework into `apps/web` composition root                                                                                                         |
| **Scope**            | `activity-timeline-hydration.ts`; extend provider stack; register Activity mapper on Event Bus at bootstrap; health fields `activities`, `timelines`; dev diagnostics mount |
| **Out of scope**     | E2E spec (AT-014); documentation (AT-015)                                                                                                                                   |
| **Deliverables**     | Hydration module; provider stack update; health extension; `ActivityTimelineDiagnostics` dev component                                                                      |
| **Tests**            | Integration — health returns new fields; hydration builds; event publish creates activity                                                                                   |
| **Dependencies**     | AT-009, AT-011, AT-012                                                                                                                                                      |
| **Estimated effort** | M                                                                                                                                                                           |

---

## AT-014 — E2E tests

| Field                | Value                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-014                                                                                                                            |
| **Objective**        | Playwright E2E verification of personal timeline, context panel tab, and action-audit activity flow                               |
| **Scope**            | `testing/playwright/e2e/spr-007-activity-timeline-framework.spec.ts`; deterministic seed via test hook; diagnostics `data-testid` |
| **Out of scope**     | Unit tests (prior stories)                                                                                                        |
| **Deliverables**     | E2E spec (≥4 scenarios); CI inclusion                                                                                             |
| **Tests**            | E2E — context panel tab open, activity list, action triggers activity item, parallel notification still works                     |
| **Dependencies**     | AT-013                                                                                                                            |
| **Estimated effort** | M                                                                                                                                 |

---

## AT-015 — Documentation & governance

| Field                | Value                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-015                                                                                                                                            |
| **Objective**        | Complete architecture, onboarding, governance, and spec index documentation                                                                       |
| **Scope**            | `activity-timeline-framework.md`; developer onboarding guide; governance handbook updates; spec index finalisation; manifest schema documentation |
| **Out of scope**     | Production readiness review (AT-016); sprint closeout (AT-018); production code                                                                   |
| **Deliverables**     | Architecture doc; `activity-timeline-onboarding.md`; updated Engineering Handbook section; `SPR-007-spec-index.md` final                          |
| **Tests**            | N/A — link and spellcheck review                                                                                                                  |
| **Dependencies**     | AT-013                                                                                                                                            |
| **Estimated effort** | M                                                                                                                                                 |

### Acceptance criteria

- [x] `activity-timeline-framework.md` — canonical architecture documented
- [x] `activity-timeline-onboarding.md` — developer onboarding complete
- [x] `SPR-007-architecture-review.md` — APPROVED WITH OBSERVATIONS
- [x] `MILESTONE-007-production-readiness.md` — PASS WITH OBSERVATIONS
- [x] Engineering Handbook, Runtime, Workbench, Capability guides updated
- [x] Architecture README, Developer README, docs/README.md updated
- [x] Spec index and CHANGELOG updated
- [x] Deferred items documented (user state, subscriptions, persistence, search, replay)

---

## AT-016 — Production readiness review & closeout

| Field                | Value                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | AT-016                                                                                                                                                                |
| **Objective**        | Produce production readiness review, milestone review, release notes, and sprint closeout for Milestone 7                                                             |
| **Scope**            | `MILESTONE-007-activity-timeline-framework-review.md`; `SPR-007-closeout.md`; `v0.7.0-activity-timeline-framework.md`; quality gate evidence; platform roadmap update |
| **Out of scope**     | Git tag creation; Milestone 8 implementation                                                                                                                          |
| **Deliverables**     | Milestone review; closeout; release notes; AT-016 completion report                                                                                                   |
| **Tests**            | Full quality gates — lint, typecheck, build, test, coverage, e2e                                                                                                      |
| **Dependencies**     | AT-014, AT-015                                                                                                                                                        |
| **Estimated effort** | S                                                                                                                                                                     |

### Acceptance criteria

- [x] Quality gates run and recorded (1308 unit, 36 E2E, 90.58% coverage)
- [x] `MILESTONE-007-activity-timeline-framework-review.md` — PASS WITH OBSERVATIONS
- [x] `SPR-007-closeout.md` complete
- [x] `v0.7.0-activity-timeline-framework.md` prepared (no tag)
- [x] README, CHANGELOG, roadmap, governance updated
- [x] M8 recommendation documented (planning only)

---

## AT-017 — Architecture review preparation (superseded)

Delivered in AT-015 as [SPR-007-architecture-review.md](../reviews/SPR-007-architecture-review.md). No separate story required.

---

## AT-018 — Sprint closeout (superseded)

Consolidated into AT-016 as [SPR-007-closeout.md](../sprint/SPR-007-closeout.md). No separate story required.

---

## Sprint 007 gate

**Do not begin AT-001 implementation** until:

1. Milestone 6 closeout owner approval recorded
2. SPR-007 sprint guide and backlog acknowledged by owner
3. Platform 4.0 accepted as active engineering baseline

**Do not begin AT-002 implementation** until:

1. AT-001 ADRs accepted
2. Architecture review recorded for implementation start

---

_SPR-007 Activity & Timeline Framework Engineering Backlog — Milestone 7 complete (AT-016); await M8 planning._
