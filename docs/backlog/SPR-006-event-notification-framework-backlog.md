# SPR-006 — Event & Notification Framework Engineering Backlog

> **Sprint:** SPR-006 — Event & Notification Framework  
> **Milestone:** 6 — Event & Notification Framework  
> **Mode:** EN-018 complete — **Milestone 6 closed; await owner approval before M7**  
> **Authority:** [SPR-006 sprint guide](./SPR-006-event-notification-framework.md) · [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md)

---

## Development workflow

Architecture redesign is not permitted. All stories extend Platform 3.0. Baseline changes require ADR.

```text
Product Requirement (Documents 021, 029)
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

## Event & Notification Framework vision

The Event & Notification Framework provides **decoupled platform communication** and **consistent in-app notification delivery**. Modules publish events; the platform determines notifications.

| Capability                    | Sprint scope             |
| ----------------------------- | ------------------------ |
| Event manifest (`event.yaml`) | ✅ Foundation            |
| Event Registry                | ✅ Foundation            |
| In-process Event Bus          | ✅ Foundation            |
| Standard event envelope       | ✅ Foundation            |
| Action audit → Event Bus      | ✅ Wire existing hook    |
| Notification Registry         | ✅ Foundation            |
| Event-to-notification mappers | ✅ Scaffold              |
| Notification Service API      | ✅ Public boundary       |
| Shell notification region     | ✅ Experience            |
| Attention / badge scaffold    | ✅ Interface + basic UI  |
| Email / push / mobile         | ⏳ Deferred              |
| Persistent event store        | ⏳ Interface stub        |
| Activity timeline UI          | ⏳ M7 Activity Framework |
| Full Attention Engine         | ⏳ Post-M6 hardening     |

**Constraint:** Modules never send notifications directly ([Document 021 §3](../021-notification-activity-attention-management-framework.md)).

---

## Story map

```text
EN-001 Event & Notification Architecture
    ↓
EN-002 Package scaffold
    ↓
EN-003 EventRegistry core ── EN-004 In-process Event Bus
    ↓
EN-005 Manifest event bootstrap ── EN-006 Server filter DTO (events)
    ↓
EN-007 NotificationRegistry core ── EN-008 Notification route providers
    ↓
EN-009 Event-to-notification mappers
    ↓
EN-010 Client hydration + hooks
    ↓
EN-011 Notification Service API
    ↓
EN-012 Notification Presentation Layer ── EN-013 Shell Experiences
    ↓
EN-014 Action audit Event Bus wire
    ↓
EN-015 Application integration (apps/web)
    ↓
EN-016 E2E tests
    ↓
EN-017 Documentation
    ↓
EN-018 Sprint closeout
```

---

## EN-001 — Event & Notification Architecture

| Field                | Value                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | EN-001                                                                                                                                                       |
| **Objective**        | Authorise Sprint 006 through accepted ADRs and story-level technical specifications                                                                          |
| **Scope**            | Package boundary ADR; Event Registry model ADR; Notification routing ADR; manifest schema proposals; `SPR-006-spec-index.md`; subsystem architecture outline |
| **Out of scope**     | Production code; Runtime/Workbench/Action/Knowledge changes                                                                                                  |
| **Deliverables**     | ADR-0030 (package), ADR-0031 (Event Registry & Bus), ADR-0032 (Notification routing); spec index; architecture outline for `event-notification-framework.md` |
| **Tests**            | N/A (documentation gate)                                                                                                                                     |
| **Dependencies**     | Platform 3.0 approved; SPR-006 sprint guide; readiness review                                                                                                |
| **Estimated effort** | M                                                                                                                                                            |

### Acceptance criteria

- [x] ADR-0030 accepted — package name, stub repurpose, export structure
- [x] ADR-0031 accepted — Event Registry, envelope, in-process bus, server-only publish
- [x] ADR-0032 accepted — Notification Registry, mapper model, no module-direct notify
- [x] Spec index lists EN-002–EN-018 specifications
- [x] Event taxonomy — System, User, Capability, Integration with examples
- [x] Notification taxonomy — Toast, Banner, Inbox, In-App, Email, SMS, Push, Webhook
- [x] Delivery channels documented separately from events
- [ ] Architecture review recorded for EN-002 start — pending

---

## EN-002 — Package scaffold

| Field                | Value                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-002                                                                                                                                                                 |
| **Objective**        | Create `@apzhub/event-notification-framework` package skeleton with exports, types, and quality gate wiring                                                            |
| **Scope**            | `package.json`, `tsconfig`, ESLint, Vitest config, empty barrel exports (`index`, `server`, `react`), monorepo workspace registration, `transpilePackages` in apps/web |
| **Out of scope**     | Registry implementation; UI; bootstrap                                                                                                                                 |
| **Deliverables**     | Package scaffold; README stub; status constant `EVENT_NOTIFICATION_FRAMEWORK_STATUS = "scaffold"`                                                                      |
| **Tests**            | Smoke test — package imports resolve                                                                                                                                   |
| **Dependencies**     | EN-001 ADRs accepted                                                                                                                                                   |
| **Estimated effort** | S                                                                                                                                                                      |

---

## EN-003 — EventRegistry core

| Field                | Value                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-003                                                                                                                |
| **Objective**        | Implement server-side Event Registry with registration, lookup, conflict diagnostics                                  |
| **Scope**            | `EventRegistry` class; `registerEvent()`, `getEvent()`, `listEvents()`; duplicate detection; readonly snapshot export |
| **Out of scope**     | Manifest extraction; client hydration; bus publish                                                                    |
| **Deliverables**     | `server/registry/event-registry.ts`; unit tests                                                                       |
| **Tests**            | Unit — register, duplicate, list, diagnostics                                                                         |
| **Dependencies**     | EN-002                                                                                                                |
| **Estimated effort** | M                                                                                                                     |

---

## EN-004 — In-process Event Bus

| Field                | Value                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-004                                                                                                                                                  |
| **Objective**        | Implement in-process Event Bus with standard envelope validation and subscribe/publish                                                                  |
| **Scope**            | `InProcessEventBus`; `PlatformEventEnvelope` types; publish validation; subscriber registry; error isolation (subscriber failure does not block others) |
| **Out of scope**     | Persistence; external broker; client publish                                                                                                            |
| **Deliverables**     | `server/bus/in-process-event-bus.ts`; envelope Zod schema; unit tests                                                                                   |
| **Tests**            | Unit — publish, subscribe, unsubscribe, invalid envelope, subscriber error isolation                                                                    |
| **Dependencies**     | EN-003                                                                                                                                                  |
| **Estimated effort** | M                                                                                                                                                       |

---

## EN-005 — Manifest event bootstrap

| Field                | Value                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-005                                                                                                                                                     |
| **Objective**        | Bootstrap Event Registry from capability manifests and platform event catalogue                                                                            |
| **Scope**            | `bootstrapEventRegistry()`; manifest `events` block extraction (ADR schema); `PlatformEventCatalogueProvider`; integration with Runtime manifest discovery |
| **Out of scope**     | Notification bootstrap; client hydration                                                                                                                   |
| **Deliverables**     | `server/bootstrap/bootstrap-event-registry.ts`; platform catalogue; integration test with fixture manifests                                                |
| **Tests**            | Integration — bootstrap from test manifests; catalogue registration                                                                                        |
| **Dependencies**     | EN-003, EN-004                                                                                                                                             |
| **Estimated effort** | M                                                                                                                                                          |

---

## EN-006 — Server filter DTO (events)

| Field                | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Story ID**         | EN-006                                                                           |
| **Objective**        | Serialise permission-filtered Event Registry DTO for client diagnostics          |
| **Scope**            | `EventRegistryDto`; `filterEventRegistryDto()`; hydration diagnostics for events |
| **Out of scope**     | Notification DTO; client provider                                                |
| **Deliverables**     | `server/filter/filter-event-registry-dto.ts`; DTO types; unit tests              |
| **Tests**            | Unit — filter strips disallowed; DTO immutability                                |
| **Dependencies**     | EN-005                                                                           |
| **Estimated effort** | S                                                                                |

---

## EN-007 — NotificationRegistry core

| Field                | Value                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-007                                                                                         |
| **Objective**        | Implement server-side Notification Registry for routes, channels, and templates                |
| **Scope**            | `NotificationRegistry`; route registration; channel enum (`in-app` only); conflict diagnostics |
| **Out of scope**     | Mappers; UI; delivery services                                                                 |
| **Deliverables**     | `server/registry/notification-registry.ts`; unit tests                                         |
| **Tests**            | Unit — register route, duplicate, list                                                         |
| **Dependencies**     | EN-002                                                                                         |
| **Estimated effort** | M                                                                                              |

---

## EN-008 — Notification route providers

| Field                | Value                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-008                                                                                                                                   |
| **Objective**        | Bootstrap notification routes from manifests and built-in platform routes                                                                |
| **Scope**            | `bootstrapNotificationRegistry()`; manifest `notifications.routes` extraction; built-in routes (action executed, system health scaffold) |
| **Out of scope**     | Event-to-notification mapping; client hydration                                                                                          |
| **Deliverables**     | `server/bootstrap/bootstrap-notification-registry.ts`; integration tests                                                                 |
| **Tests**            | Integration — manifest routes registered                                                                                                 |
| **Dependencies**     | EN-007, EN-005                                                                                                                           |
| **Estimated effort** | M                                                                                                                                        |

---

## EN-009 — Event-to-notification mappers

| Field                | Value                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-009                                                                                                                                   |
| **Objective**        | Implement mapper subscribers that create notification DTOs from platform events                                                          |
| **Scope**            | `EventToNotificationMapper`; subscribe on bus; in-memory notification store per session; map action audit events to in-app notifications |
| **Out of scope**     | Email/push; persistent store; Activity stream                                                                                            |
| **Deliverables**     | `server/mappers/event-to-notification-mapper.ts`; session notification store; unit + integration tests                                   |
| **Tests**            | Integration — publish event → notification created                                                                                       |
| **Dependencies**     | EN-004, EN-008                                                                                                                           |
| **Estimated effort** | L                                                                                                                                        |

---

## EN-010 — Client hydration + hooks

| Field                | Value                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-010                                                                                                                 |
| **Objective**        | Deliver client hydration bundle and React provider with registry hooks                                                 |
| **Scope**            | `EventNotificationProvider`; `useEventRegistry()`; `buildEventNotificationHydrationDto()`; read-only client registries |
| **Out of scope**     | Notification Service public API (EN-011); shell UI                                                                     |
| **Deliverables**     | `react/provider/`; `server/hydration/`; component tests                                                                |
| **Tests**            | Component — provider renders; hook throws outside provider                                                             |
| **Dependencies**     | EN-006, EN-008, EN-009                                                                                                 |
| **Estimated effort** | M                                                                                                                      |

---

## EN-011 — Notification Service API

| Field                | Value                                                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-011                                                                                                                                                                                    |
| **Objective**        | Implement public Notification Service boundary and `useNotificationService()` hook                                                                                                        |
| **Scope**            | `NotificationService`; `createNotificationServiceFromHydration()`; `listNotifications`, `markRead`, `markAllRead`, `subscribe`, `getDiagnostics`; deprecate any internal-only query paths |
| **Out of scope**     | Presentation mapping; shell Experiences                                                                                                                                                   |
| **Deliverables**     | `react/hooks/use-notification-service.ts`; service implementation; unit tests                                                                                                             |
| **Tests**            | Unit — list, mark read, subscribe callback                                                                                                                                                |
| **Dependencies**     | EN-010                                                                                                                                                                                    |
| **Estimated effort** | M                                                                                                                                                                                         |

---

## EN-012 — Notification Presentation Layer

| Field                | Value                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | EN-012                                                                                                                         |
| **Objective**        | Implement Presentation Layer helpers mapping notification DTOs to view models                                                  |
| **Scope**            | `mapNotificationDtoToViewModel()`; grouping by priority; relative timestamps; actionRef passthrough for `execute()` delegation |
| **Out of scope**     | Shell layout; Event Bus                                                                                                        |
| **Deliverables**     | `react/presentation/` or `@apzhub/workspace` helpers (per ADR); unit tests                                                     |
| **Tests**            | Unit — mapping, grouping, empty state                                                                                          |
| **Dependencies**     | EN-011                                                                                                                         |
| **Estimated effort** | M                                                                                                                              |

---

## EN-013 — Notification shell Experiences

| Field                | Value                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-013                                                                                                                                                     |
| **Objective**        | Deliver Notification Panel and Badge Experiences in Desktop Shell                                                                                          |
| **Scope**            | `NotificationPanelExperience`; `NotificationBadgeExperience`; shell region wiring; enable flags on `DesktopShell`; selection delegates to Action Framework |
| **Out of scope**     | Global toast system redesign; mobile push                                                                                                                  |
| **Deliverables**     | Experiences in workspace; shell integration; component tests                                                                                               |
| **Tests**            | Component — render list, mark read, badge count                                                                                                            |
| **Dependencies**     | EN-012                                                                                                                                                     |
| **Estimated effort** | L                                                                                                                                                          |

---

## EN-014 — Action audit Event Bus wire

| Field                | Value                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | EN-014                                                                                                                         |
| **Objective**        | Connect Action Framework audit hook to Event Bus publish path                                                                  |
| **Scope**            | Replace no-op audit stub with `publishActionExecutedEvent()`; standard envelope for action audit; no executor behaviour change |
| **Out of scope**     | Persistent audit store; Activity Framework                                                                                     |
| **Deliverables**     | Wire in `command-framework` audit hook → ENF bus adapter; integration test                                                     |
| **Tests**            | Integration — execute action → event published → notification created (with EN-009)                                            |
| **Dependencies**     | EN-004, EN-009                                                                                                                 |
| **Estimated effort** | M                                                                                                                              |

---

## EN-015 — Application integration (apps/web)

| Field                | Value                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-015                                                                                                                                   |
| **Objective**        | Wire Event & Notification Framework into `apps/web` composition root                                                                     |
| **Scope**            | `event-notification-hydration.ts`; extend `ActionWorkbenchShellProvider`; health fields `events`, `notifications`; dev diagnostics mount |
| **Out of scope**     | E2E spec (EN-016); documentation (EN-017)                                                                                                |
| **Deliverables**     | Hydration module; provider stack update; health extension; `EventNotificationDiagnostics` dev component                                  |
| **Tests**            | Integration — health returns new fields; hydration builds                                                                                |
| **Dependencies**     | EN-010, EN-011, EN-013, EN-014                                                                                                           |
| **Estimated effort** | M                                                                                                                                        |

---

## EN-016 — E2E tests

| Field                | Value                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-016                                                                                                                             |
| **Objective**        | Playwright E2E verification of notification panel, badge, and action-audit notification flow                                       |
| **Scope**            | `testing/playwright/e2e/spr-006-event-notification-framework.spec.ts`; deterministic seed via test hook; diagnostics `data-testid` |
| **Out of scope**     | Unit tests (prior stories)                                                                                                         |
| **Deliverables**     | E2E spec (≥4 scenarios); CI inclusion                                                                                              |
| **Tests**            | E2E — panel open, notification list, mark read, badge update, action triggers notification                                         |
| **Dependencies**     | EN-015                                                                                                                             |
| **Estimated effort** | M                                                                                                                                  |

---

## EN-017 — Documentation

| Field                | Value                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Story ID**         | EN-017                                                                                                                                                       |
| **Objective**        | Complete architecture, onboarding, governance, and production readiness documentation                                                                        |
| **Scope**            | `event-notification-framework.md`; developer onboarding; architecture review; production readiness review; governance guide updates; spec index finalisation |
| **Out of scope**     | Sprint closeout (EN-018); production code                                                                                                                    |
| **Deliverables**     | Architecture doc; onboarding; `SPR-006-architecture-review.md`; `MILESTONE-006-production-readiness.md`                                                      |
| **Tests**            | N/A — link and spellcheck review                                                                                                                             |
| **Dependencies**     | EN-015                                                                                                                                                       |
| **Estimated effort** | M                                                                                                                                                            |

---

## EN-018 — Sprint closeout

| Field                | Value                                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Story ID**         | EN-018                                                                                                                                                            |
| **Objective**        | Close Sprint 006 with closeout report, milestone review, release notes, roadmap update                                                                            |
| **Scope**            | `SPR-006-closeout.md`; `MILESTONE-006-event-notification-framework-review.md`; `v0.6.0-event-notification-framework.md`; quality gate run; engineering statistics |
| **Out of scope**     | Milestone 7 planning                                                                                                                                              |
| **Deliverables**     | Closeout; milestone review; release notes; CHANGELOG entry                                                                                                        |
| **Tests**            | Full quality gates — lint, typecheck, build, test, coverage, e2e                                                                                                  |
| **Dependencies**     | EN-016, EN-017                                                                                                                                                    |
| **Estimated effort** | S                                                                                                                                                                 |

---

## Sprint 006 gate

**Do not begin EN-011 implementation** until:

1. EN-010 review complete
2. [EN-010 completion report](../sprint/EN-010-completion-report.md) acknowledged

---

_SPR-006 Event & Notification Framework Engineering Backlog — planning complete._
