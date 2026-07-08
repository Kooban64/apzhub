# SPR-006 — Sprint Closeout Report

> **Sprint:** SPR-006 — Event & Notification Framework  
> **Milestone:** 6 — Event & Notification Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **awaiting owner approval before tag and Milestone 7 planning**

---

## Executive summary

SPR-006 delivered `@apzhub/event-notification-framework` — the APZHUB unified event and notification platform layer. Eighteen sequential stories (EN-001–EN-018) implemented the Event Registry, in-process Event Bus, Notification Registry, Notification Mapper, Notification Service, Notification Presentation Layer, Notification Experiences, Action audit integration, application wiring, E2E verification, documentation, governance, and formal closeout.

The framework integrates with the Action Framework audit hook and existing Workbench shell without a parallel execution pipeline. Successful actions publish `capability.action.executed`; notification routes map to in-app badge and panel Experiences.

**Recommended release tag:** `v0.6.0-event-notification-framework` (do **not** create until owner instructs).

---

## Story summary (EN-001 – EN-018)

| Story  | Title                                | Status |
| ------ | ------------------------------------ | ------ |
| EN-001 | Event & Notification Architecture    | ✅     |
| EN-002 | Package scaffold                     | ✅     |
| EN-003 | EventRegistry core                   | ✅     |
| EN-004 | In-process Event Bus                 | ✅     |
| EN-005 | Manifest event bootstrap             | ✅     |
| EN-006 | Server filter DTO (events)           | ✅     |
| EN-007 | NotificationRegistry core            | ✅     |
| EN-008 | Notification route providers         | ✅     |
| EN-009 | Event-to-notification mappers        | ✅     |
| EN-010 | Client hydration + hooks             | ✅     |
| EN-011 | Notification Service API             | ✅     |
| EN-012 | Notification Presentation Layer      | ✅     |
| EN-013 | Notification shell Experiences       | ✅     |
| EN-014 | Action audit Event Bus wire          | ✅     |
| EN-015 | Application integration (`apps/web`) | ✅     |
| EN-016 | E2E verification                     | ✅     |
| EN-017 | Documentation, governance, readiness | ✅     |
| EN-018 | Sprint closeout (this document)      | ✅     |

**Package status:** `EVENT_NOTIFICATION_SERVER_STATUS = "integration"` · `EVENT_NOTIFICATION_REACT_STATUS = "integration"` · `EVENT_NOTIFICATION_FRAMEWORK_STATUS = "scaffold"` (foundation layer; external delivery deferred).

---

## Deliverables

### Package (`@apzhub/event-notification-framework`)

| Area               | Deliverable                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Event layer        | EventRegistry, InProcessEventBus, bootstrap, DTO filter, platform catalogue                                                |
| Notification layer | NotificationRegistry, DefaultNotificationMapper, DefaultNotificationService                                                |
| Integration        | Action audit publisher, `wireAppEventNotifications()`, shared context factory                                              |
| Presentation       | View model mapping, priority grouping, relative timestamps                                                                 |
| React              | `NotificationRegistryProvider`, `NotificationServiceProvider`, `useNotificationService()`, `useNotificationPresentation()` |

### Workbench (`@apzhub/workspace`)

| Area                     | Deliverable                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Presentation consumption | Badge and panel use Presentation Layer hooks                                           |
| Experiences              | `NotificationBadgeExperience`, `NotificationPanelExperience`, `WorkbenchNotifications` |
| Shell                    | `enableNotificationBadge` / `enableNotificationPanel` on DesktopShell                  |

### Application (`apps/web`)

| Area        | Deliverable                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| Context     | `createAppEventNotificationContext()`, shared loader, production subscriber |
| Hydration   | `event-notification-hydration.ts`, layout DTO parallel load                 |
| Shell       | `ActionWorkbenchShellProvider` — providers + audit hook                     |
| Health      | `/api/health` `events` + `notifications` fields                             |
| Diagnostics | `EventNotificationDiagnostics` (dev/test only)                              |
| E2E hooks   | `__APZHUB_E2E__` (env-gated test infrastructure)                            |

### ADRs

- ADR-0030 — Event & Notification Framework package
- ADR-0031 — Event Registry and in-process Event Bus
- ADR-0032 — Notification routing and event separation

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
Notification Mapping
        ↓
Notification Service
        ↓
Notification Presentation Layer
        ↓
Notification Experiences
```

Public client boundaries: **`useNotificationService()`** and **`useNotificationPresentation()`**.

Reference: [event-notification-framework.md](../architecture/event-notification-framework.md)

### Compliance

| Rule / ADR                                            | Result |
| ----------------------------------------------------- | ------ |
| ADR-0030 Package boundaries                           | ✅     |
| ADR-0031 Event Registry & Bus                         | ✅     |
| ADR-0032 Event/notification separation                | ✅     |
| Registry Pattern — server authority, client read-only | ✅     |
| No business modules                                   | ✅     |
| Baseline v1.0 frozen                                  | ✅     |

See [SPR-006 architecture review](../reviews/SPR-006-architecture-review.md).

---

## Engineering statistics

| Metric               | Value (EN-018 closeout)               |
| -------------------- | ------------------------------------- |
| Sprint stories       | 18 (EN-001–EN-018)                    |
| Unit/component tests | **1098** (204 files)                  |
| E2E tests            | **30** (+6 spr-006)                   |
| Statement coverage   | **90.75%**                            |
| Branch coverage      | 87.08%                                |
| ADRs accepted        | 0030–0032                             |
| Spec documents       | 30+ SPR-006 specs + architecture docs |
| Completion reports   | 18 (EN-001–EN-018)                    |

---

## Quality gates

All gates passed at EN-018 closeout (2026-07-04):

| Gate                 | Result                      |
| -------------------- | --------------------------- |
| `pnpm lint`          | ✅ Pass                     |
| `pnpm typecheck`     | ✅ Pass                     |
| `pnpm build`         | ✅ Pass                     |
| `pnpm test`          | ✅ Pass — 1098 tests        |
| `pnpm test:coverage` | ✅ Pass — 90.75% statements |
| `pnpm test:e2e`      | ✅ Pass — 30 E2E tests      |

---

## Testing

| Layer                                          | Coverage                                             |
| ---------------------------------------------- | ---------------------------------------------------- |
| Event Registry, bootstrap, DTO                 | Unit                                                 |
| Event Bus, envelope validation                 | Unit                                                 |
| Notification Registry, mapper, templates       | Unit                                                 |
| Notification Service, session store            | Unit                                                 |
| Presentation layer, grouping, timestamps       | Unit                                                 |
| Experiences (badge, panel)                     | Component                                            |
| App wiring, health, audit → notification       | Integration                                          |
| Health, badge, panel, action flow, diagnostics | E2E (`spr-006-event-notification-framework.spec.ts`) |

E2E scenarios: health `events`/`notifications`, provider bootstrap, panel UX, action → badge/panel, mark read/all, diagnostics guard.

---

## Documentation

| Document               | Path                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Combined architecture  | [event-notification-framework.md](../architecture/event-notification-framework.md)                                      |
| Event subsystem        | [event-framework.md](../architecture/event-framework.md)                                                                |
| Notification subsystem | [notification-framework.md](../architecture/notification-framework.md)                                                  |
| Developer onboarding   | [event-notification-onboarding.md](../developer/event-notification-onboarding.md)                                       |
| Architecture review    | [SPR-006-architecture-review.md](../reviews/SPR-006-architecture-review.md)                                             |
| Production readiness   | [MILESTONE-006-production-readiness.md](../reviews/MILESTONE-006-production-readiness.md)                               |
| Milestone review       | [MILESTONE-006-event-notification-framework-review.md](../reviews/MILESTONE-006-event-notification-framework-review.md) |
| Release notes          | [v0.6.0-event-notification-framework.md](../releases/v0.6.0-event-notification-framework.md)                            |
| Spec index             | [SPR-006-spec-index.md](../specs/SPR-006-spec-index.md)                                                                 |

---

## Governance

Updated in EN-017:

- [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md) — M6 in build order, testing, doc index
- [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) — manifest `events` + `notifications.routes`
- [Runtime Development Guide](../governance/APZHUB-Runtime-Development-Guide.md) — bootstrap, health fields
- [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md) — Notification Experiences

---

## Developer experience

Engineers can:

- Declare platform events in catalogue or manifest `events` blocks
- Register notification routes with `eventPattern`, kind, channel, templates
- Rely on Action audit hook for `capability.action.executed` without custom wiring
- Consume **`useNotificationPresentation()`** in new Notification Experiences
- Verify integration via dev diagnostics and `/api/health` `events` / `notifications`
- Run E2E with `NEXT_PUBLIC_E2E_TEST_HOOKS` and `spr-006-event-notification-framework.spec.ts`

Onboarding: [event-notification-onboarding.md](../developer/event-notification-onboarding.md)

---

## Consolidated technical debt

| ID         | Item                                                             | Target                                |
| ---------- | ---------------------------------------------------------------- | ------------------------------------- |
| TD-EN15-01 | App notification routes in `register-app-notification-routes.ts` | Platform notification catalogue       |
| TD-EN15-02 | Server/client context instances separate                         | By design — document in onboarding    |
| TD-EN15-03 | `createRandomUuid` duplicated in command-framework and ENF       | Shared util consolidation             |
| TD-EN16-01 | E2E `__APZHUB_E2E__` hook                                        | Documented — test infrastructure only |
| TD-EN16-02 | Inbox + toast routes both in panel                               | Dedicated toast Experience deferred   |
| TD-AF-M4   | Service action handlers `NOT_IMPLEMENTED`                        | Platform services milestone           |
| TD-M8-RBAC | Full RBAC population from auth session                           | Milestone 8                           |

---

## Deferred work

| Item                                     | Notes                                      |
| ---------------------------------------- | ------------------------------------------ |
| Dedicated toast / banner UI regions      | Routes registered; panel lists toast items |
| Email / SMS / push / webhook delivery    | Channel stubs; Delivery Service M8+        |
| Persistent notification store            | Session-scoped store only                  |
| External Event Bus transport             | In-process only; broker M10                |
| Activity timeline subscriber             | M7 Activity Framework                      |
| Attention engine / digests / quiet hours | Document 021 future scope                  |

---

## Recommended release

**Tag:** `v0.6.0-event-notification-framework`  
**Baseline:** `v0.5.0-knowledge-discovery-framework`

Do **not** create the Git tag until owner instructs.

---

## Recommendation for Milestone 7

**Planning only — do not implement.**

Per [Platform Roadmap](../architecture/platform-roadmap.md), Milestone 7 is the **Activity Framework**. Recommended next steps for owners:

1. Approve Milestone 6 closeout and optional `v0.6.0-event-notification-framework` tag
2. Author Sprint 007 backlog from Document 021 Activity surfaces
3. Subscribe Activity to existing Event Bus — parallel consumer pattern (same as Notification Mapping)
4. Preserve event/notification separation — Activity items are not notifications
5. Defer external delivery and persistence to M8+ Delivery Service stories

---

## Stop condition

**Do not plan or implement Milestone 7** until owner approves this closeout.

---

_SPR-006 Sprint Closeout — Event & Notification Framework._
