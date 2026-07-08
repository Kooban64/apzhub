# ADR-0033 — Activity & Timeline Framework Package

> **Status:** Accepted  
> **Date:** 2026-07-04  
> **Sprint:** SPR-007 — AT-001  
> **Decided by:** Project owner (Sprint 007 authorisation)  
> **Related:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [ADR-0030](./ADR-0030-event-notification-framework-package.md) · [ADR-0031](./ADR-0031-event-registry-and-bus.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

## Problem

Milestone 7 delivers the **Activity & Timeline Framework** — a platform layer that consumes Platform Events and presents historical activity timelines. It is **not** an audit framework, notification framework, event store, or logging system.

Document 021 defines Activity and Attention as distinct from Notifications. Platform 4.0 delivers Event Bus and Notification Mapping in `@apzhub/event-notification-framework`. Activity Mapping must be a **parallel Event Bus subscriber** without modifying ENF or conflating activity with notifications.

Packaging options:

1. **Option A** — Dedicated `@apzhub/activity-timeline-framework` package (mirrors ADR-0027, ADR-0030).
2. **Option B** — Extend `@apzhub/event-notification-framework` with an Activity subsystem.
3. **Option C** — Implement within `@apzhub/workbench-framework` (Context Panel owns timeline UI).

Option B couples unrelated lifecycles and violates separation established in ADR-0032. Option C mixes Workbench orchestration with activity domain logic and Event Bus subscription.

## Decision

**Option A — Dedicated `@apzhub/activity-timeline-framework` package with separate Activity and Timeline subsystems.**

| Item           | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Package path   | `packages/activity-timeline-framework/` created in **AT-002**                        |
| npm name       | `@apzhub/activity-timeline-framework`                                                |
| Primary export | `@apzhub/activity-timeline-framework`                                                |
| Server export  | `@apzhub/activity-timeline-framework/server`                                         |
| React export   | `@apzhub/activity-timeline-framework/react` (AT-009)                                 |
| Event Bus      | **Consumes** `@apzhub/event-notification-framework` Event Bus — does not reimplement |

**Conceptual separation within the package:**

```text
server/activity/     Activity Registry · Activity Mapper · Activity Service store
server/timeline/     Timeline Registry · scope resolution · grouping rules
presentation/        View model mappers (also exported via /react)
```

Activity modules **must not** publish business events. Activity modules **must not** write to Notification Service. Timeline Experiences **must not** import Event Bus.

### Layer separation

| Layer                       | Owner                                  | Publishes events? |
| --------------------------- | -------------------------------------- | ----------------- |
| Event Bus                   | `@apzhub/event-notification-framework` | N/A (transport)   |
| Activity Mapping            | ATF `/server`                          | ❌ Subscribe only |
| Activity Service            | ATF `/server` + `/react`               | ❌                |
| Activity Presentation Layer | ATF `/presentation` + `/react`         | ❌                |
| Timeline Experiences        | `@apzhub/workspace`                    | ❌                |

### Package responsibilities — Activity subsystem

- **ActivityRegistry** — activity type descriptors, templates, presentation metadata
- **DefaultActivityMapper** — Event Bus subscriber → `ActivityItem`
- **ActivitySessionStore** — in-session activity index (SPR-007 foundation)
- **ActivityService** — public client API (AT-008)
- **Server filter** — `filterActivityRegistryDto()` mirroring established pattern

### Package responsibilities — Timeline subsystem

- **TimelineRegistry** — timeline scope definitions (personal, workspace, system)
- **TimelineResolver** — maps ActivityItems to timeline scopes
- **Grouping helpers** — date/actor grouping for Presentation Layer

### Package does **not** own

- Event Registry or Event Bus implementation (ENF)
- Notification Registry, Mapper, or Service (ENF)
- Action Registry or CommandExecutor (`@apzhub/command-framework`)
- Knowledge Registry or Service (`@apzhub/knowledge-discovery-framework`)
- Workbench Manager or engines (`@apzhub/workbench-framework`)
- Immutable audit log persistence (M8+)
- External real-time transport (WebSocket/SSE — interface stub only)
- Timeline **Experiences** UI (`@apzhub/workspace`)

### Dependency direction

```text
apps/web
    ↓
@apzhub/workspace                    (Timeline Experiences)
    ↓
@apzhub/activity-timeline-framework/react   (ActivityService hooks)
    ↓
@apzhub/activity-timeline-framework/server  (Mapper · registries · service)
    ↓
@apzhub/event-notification-framework/server (Event Bus — subscribe only)
@apzhub/command-framework                   (audit events — upstream publisher)
@apzhub/platform-runtime/server             (manifest extraction input)
@apzhub/types                               (shared DTO types)
```

**Rules:**

1. ATF **must not** import Workbench engines, NotificationService, or Knowledge orchestrator.
2. ATF **must not** reimplement Event Bus or envelope validation.
3. UI packages **must not** import ATF `/server` in client bundles.
4. Activity records are created **only** by Activity Mapping — not by modules or Experiences.

### Status constant

Export `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "scaffold"` from AT-002.

## Alternatives

| Alternative                   | Why rejected                                              |
| ----------------------------- | --------------------------------------------------------- |
| Activity subsystem inside ENF | Violates separation; couples M6 and M7 lifecycles         |
| Workbench-only implementation | Event subscription in UI layer; no Service boundary       |
| Standalone audit package      | Conflicts with Document 021 activity vs audit distinction |

## Consequences

- AT-002 creates `packages/activity-timeline-framework/`
- `apps/web/next.config.ts` `transpilePackages` updated in AT-013
- Activity Mapping wires to existing `EventBus` instance from shared app context
- Timeline Experiences follow Experience Pattern — consume `useActivityPresentation()`
- ADR-0034 and ADR-0035 define registry and routing models

---

_ADR-0033 — Activity & Timeline Framework Package — Accepted at AT-001._
