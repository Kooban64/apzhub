# Activity & Timeline Framework — Architecture

> **Milestone:** 7 — Activity & Timeline Framework  
> **Package:** `@apzhub/activity-timeline-framework`  
> **Status:** **Complete (AT-001–AT-016)** — Milestone 7 closed; M8 planning gate next  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · ADRs [0033](../adr/ADR-0033-activity-timeline-framework-package.md) · [0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [0035](../adr/ADR-0035-activity-execution-routing.md)

---

## Executive summary

The Activity & Timeline Framework consumes **Platform Events** from the existing Event Bus and presents **historical activity timelines** for users and administrators. It is not an audit framework, notification framework, event store, or logging system.

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

Activity Mapping is a **sibling** of Notification Mapping. Both subscribe to the Event Bus independently. Same event may produce both a notification and an activity item — intentional fan-out.

---

## What this framework is not

| Concern                | Relationship                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| Audit framework        | Activity may reference source events; immutable audit store is M8+ |
| Notification framework | Parallel subscriber; separate service and Experiences              |
| Event store            | No event persistence or replay                                     |
| Logging system         | User-facing timeline semantics — not operational logs              |

---

## Layer stack

```text
┌─────────────────────────────────────────────────────────────┐
│              Timeline Experiences (@apzhub/workspace)        │
│    Context Panel Activity tab · WorkbenchActivityTimeline    │
└─────────────────────────────┬───────────────────────────────┘
                              │ useActivityTimelineExperienceDiagnostics()
                              │ (→ useActivityPresentation())
┌─────────────────────────────▼───────────────────────────────┐
│           Activity Presentation Layer (ATF)                   │
│   ActivityViewModel · date grouping · relative timestamps     │
└─────────────────────────────┬───────────────────────────────┘
                              │ ActivityTimelineService (public)
┌─────────────────────────────▼───────────────────────────────┐
│                   Activity Service (ATF)                      │
│   session store · listActivities · queryTimeline               │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│     Activity Mapping (DefaultEventToActivityMapper)           │
│     wireAppActivityTimeline() — subscribes; never publishes   │
└─────────────────────────────┬───────────────────────────────┘
                              │ subscribe (shared Event Bus)
┌─────────────────────────────▼───────────────────────────────┐
│     In-Process Event Bus (@apzhub/event-notification-framework)│
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│   Activity Registry · Timeline Registry · Manifest bootstrap │
│   filterActivityRegistryDto · filterTimelineRegistryDto       │
│   buildActivityTimelineHydrationBundle()                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│   Platform Capabilities · Action audit hook · Runtime manifest │
└─────────────────────────────────────────────────────────────┘
```

---

## Subsystems (delivered)

| Subsystem                                             | Story  | Role                                                  |
| ----------------------------------------------------- | ------ | ----------------------------------------------------- |
| ActivityRegistry                                      | AT-003 | Activity type index                                   |
| TimelineRegistry                                      | AT-004 | Timeline scope descriptors                            |
| bootstrapActivityRegistry / bootstrapTimelineRegistry | AT-005 | Catalogue + manifest extraction                       |
| filterActivityRegistryDto / filterTimelineRegistryDto | AT-006 | Permission-filtered DTO                               |
| DefaultEventToActivityMapper                          | AT-007 | Event → ActivityDocument                              |
| DefaultActivityService                                | AT-008 | Session store + internal API                          |
| Client hydration                                      | AT-009 | Read-only registries, providers, hooks                |
| ActivityTimelineService                               | AT-010 | Public client service boundary                        |
| Activity Presentation Layer                           | AT-011 | View models, grouping, timestamps                     |
| Timeline Experiences                                  | AT-012 | ActivityTimelineExperience, panel, Workbench composer |
| apps/web integration                                  | AT-013 | Bootstrap, providers, health, Context Panel           |
| E2E verification                                      | AT-014 | Playwright + env-gated test hooks                     |
| Documentation                                         | AT-015 | Architecture, onboarding, governance                  |

---

## Parallel Event Bus subscribers

```text
Event: capability.action.executed
        │
        ├──► NotificationMapper → NotificationService → Badge/Panel
        │
        └──► ActivityMapper → ActivityService → Context Panel Timeline
```

Same event. Different artefacts. No cross-service writes.

---

## Public APIs

| API                                          | Layer                   | Consumers                                    |
| -------------------------------------------- | ----------------------- | -------------------------------------------- |
| `useActivityService()`                       | ActivityTimelineService | Internal hooks; experiences use presentation |
| `useActivityPresentation()`                  | Presentation            | View models, groups                          |
| `useActivityTimelineExperienceDiagnostics()` | Experiences             | Timeline UI surfaces                         |
| `ActivityTimelineProvider`                   | Hydration               | Registry metadata                            |
| `ActivityTimelineServiceProvider`            | Service                 | Shared session store                         |
| `WorkbenchActivityTimeline`                  | Experience composer     | Context Panel, inline feed                   |

Experiences **must not** import Event Bus, `DefaultActivityService`, or mapper internals.

---

## Application integration (`apps/web`)

| Component                            | Path                                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| `createAppActivityTimelineContext()` | Composition root — registries, mapper, service, Event Bus wire |
| `loadActivityTimelineHydration()`    | Permission-filtered bundle for layout                          |
| `ActionWorkbenchShellProvider`       | Provider stack                                                 |
| `ActivityTimelineDiagnostics`        | Dev-only hidden diagnostics                                    |
| `/api/health`                        | `activities` + `timelines` fields                              |

Provider order:

```text
NotificationRegistryProvider → NotificationServiceProvider → WorkbenchProvider
  → ActivityTimelineProvider → ActivityTimelineServiceProvider
    → CommandRegistryProvider → DesktopShell / Timeline Experiences
```

See [AT-013 application integration](../sprint/AT-013-application-integration.md).

---

## Context Panel

| Flag                          | Surface                    |
| ----------------------------- | -------------------------- |
| `enableActivityTimeline`      | Feature gate               |
| `enableActivityTimelinePanel` | Context Panel Activity tab |

`WorkbenchContextPanelActivityTab` consumes `WorkbenchActivityTimeline` (`variant="panel"`) — no duplicate presentation logic in `@apzhub/workspace`.

---

## Extension points (deferred)

| Extension                         | Mechanism                         | Target        |
| --------------------------------- | --------------------------------- | ------------- |
| User state (viewed/unread)        | Service API extension             | M8+           |
| Live subscriptions                | `useSyncExternalStore` on service | Post-M7       |
| Persistent store                  | Replace session store backend     | M8+           |
| Event replay                      | Event store integration           | M10+          |
| Search / filter UI                | Experience layer                  | Product story |
| Team timelines RBAC               | Identity + scope model            | M8+           |
| `actionRef` from mapper templates | Payload → payloadSummary          | Enhancement   |

See [SPR-007-ATF-extension-points.md](../specs/SPR-007-ATF-extension-points.md).

---

## Related documents

| Document                                                                               | Topic                              |
| -------------------------------------------------------------------------------------- | ---------------------------------- |
| [SPR-007 spec index](../specs/SPR-007-spec-index.md)                                   | Story specifications               |
| [Activity Timeline onboarding](../developer/activity-timeline-onboarding.md)           | Developer guide                    |
| [SPR-007 architecture review](../reviews/SPR-007-architecture-review.md)               | M7 architecture verdict            |
| [MILESTONE-007 production readiness](../reviews/MILESTONE-007-production-readiness.md) | Release readiness                  |
| [event-notification-framework.md](./event-notification-framework.md)                   | Event Bus owner                    |
| [Platform Reference Patterns](./APZHUB-Platform-Reference-Patterns.md)                 | Registry, DTO, Experience patterns |

---

_Activity & Timeline Framework Architecture — AT-015 complete._
