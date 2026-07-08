# SPR-007 — Technical Specification Index

> **Status:** Complete — AT-001–AT-016 delivered; Milestone 7 closed  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Authority:** [SPR-007 backlog](../backlog/SPR-007-activity-timeline-framework-backlog.md) · [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md) · ADRs 0033–0035

---

## Locked architectural decisions (owner approved)

| Topic                  | Decision                                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| Manifest block         | **`activities.types`** — not `activity.types`                              |
| Default timeline scope | **`timeline.personal`**                                                    |
| Reserved scopes        | `timeline.team`, `timeline.organization`, `timeline.system`                |
| Permissions            | Platform Permission Adapter only — Activity Service receives filtered data |
| Deduplication          | Optional — default **none** (extension point)                              |
| UI                     | Independent Workbench Experience — not notification surfaces               |
| Bootstrap              | Platform activity types only; business types in capability manifests       |

---

## ADRs (AT-001)

| ADR                                                                 | Title                                 | Status   |
| ------------------------------------------------------------------- | ------------------------------------- | -------- |
| [ADR-0033](../adr/ADR-0033-activity-timeline-framework-package.md)  | Activity & Timeline Framework Package | Accepted |
| [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) | Activity Registry and Timeline Model  | Accepted |
| [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)           | Activity Execution Routing            | Accepted |

---

## Architecture documents (AT-001)

| Document                                                                                       | Layer           | Description                                                   |
| ---------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------- |
| [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)               | Overview        | Combined Activity & Timeline Framework canonical architecture |
| [event-notification-framework.md](../architecture/event-notification-framework.md)             | Event Bus owner | Upstream Event Bus — ATF consumes, does not modify            |
| [APZHUB-Platform-Reference-Patterns.md](../architecture/APZHUB-Platform-Reference-Patterns.md) | Patterns        | Registry Pattern, Presentation Layer, Experience Pattern      |

---

## Canonical pipeline

```text
Platform Capability
        ↓
Domain Event (standard envelope — Document 029)
        ↓
Event Bus (@apzhub/event-notification-framework)
        ↓
Activity Mapping (parallel subscriber — not notification path)
        ↓
Activity Service
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences
        ↓
Context Panel
```

**Parallel subscribers:**

```text
                    Event Bus
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
Event-to-Notification Mapper    Event-to-Activity Mapper
          │                           │
          ▼                           ▼
Notification Service            Activity Service
          │                           │
          ▼                           ▼
Notification Experiences        Timeline Experiences
```

---

## Specification documents

| Document                                                                                   | Stories                | Description                                                    |
| ------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------- |
| [SPR-007-ATF-activity-architecture.md](./SPR-007-ATF-activity-architecture.md)             | AT-001                 | Activity model, taxonomy, event/notification separation        |
| [SPR-007-ATF-activity-registry.md](./SPR-007-ATF-activity-registry.md)                     | AT-003                 | Activity Registry — **implemented**                            |
| [SPR-007-ATF-activity-metadata.md](./SPR-007-ATF-activity-metadata.md)                     | AT-003                 | Activity metadata projection — **implemented**                 |
| [SPR-007-ATF-timeline-registry.md](./SPR-007-ATF-timeline-registry.md)                     | AT-004                 | Timeline Registry — **implemented**                            |
| [SPR-007-ATF-timeline-definition.md](./SPR-007-ATF-timeline-definition.md)                 | AT-004                 | TimelineDefinition model — **implemented**                     |
| [SPR-007-ATF-timeline-model.md](./SPR-007-ATF-timeline-model.md)                           | AT-004                 | Timeline scopes, grouping, visibility                          |
| [SPR-007-ATF-activity-document.md](./SPR-007-ATF-activity-document.md)                     | AT-001, AT-007         | ActivityItem schema, metadata, vs NotificationItem             |
| [SPR-007-ATF-activity-bootstrap.md](./SPR-007-ATF-activity-bootstrap.md)                   | AT-005                 | bootstrapActivityRegistry, bootstrapTimelineRegistry sequence  |
| [SPR-007-ATF-activity-manifest.md](./SPR-007-ATF-activity-manifest.md)                     | AT-001, AT-005         | Manifest `activities.types` and `timelines.scopes` YAML schema |
| [SPR-007-ATF-activity-registry-dto.md](./SPR-007-ATF-activity-registry-dto.md)             | AT-006                 | ActivityRegistryDto, TimelineRegistryDto, filter               |
| [SPR-007-ATF-activity-client-hydration.md](./SPR-007-ATF-activity-client-hydration.md)     | AT-009                 | Providers, hooks, read-only client rules                       |
| [SPR-007-ATF-activity-service.md](./SPR-007-ATF-activity-service.md)                       | AT-008                 | ActivityService API, session store, subscribe                  |
| [SPR-007-ATF-activity-presentation-layer.md](./SPR-007-ATF-activity-presentation-layer.md) | AT-010                 | View models, grouping, timestamps                              |
| [SPR-007-ATF-timeline-experiences.md](./SPR-007-ATF-timeline-experiences.md)               | AT-011, AT-012         | Feed, context panel tab, enable flags                          |
| [SPR-007-ATF-health-endpoint-activities.md](./SPR-007-ATF-health-endpoint-activities.md)   | AT-013                 | `/api/health` activities and timelines fields                  |
| [SPR-007-ATF-diagnostics.md](./SPR-007-ATF-diagnostics.md)                                 | AT-001, AT-013, AT-014 | getDiagnostics, hidden testids, production guard               |
| [SPR-007-ATF-extension-points.md](./SPR-007-ATF-extension-points.md)                       | AT-001                 | Deferred capabilities, interface stubs                         |

---

## Story quick reference

| Story  | Title                                  | Primary spec                                                                                                                                                          | ADR       |
| ------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AT-001 | Activity & Timeline Architecture       | [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [Extension points](./SPR-007-ATF-extension-points.md) · [Diagnostics](./SPR-007-ATF-diagnostics.md) | 0033–0035 |
| AT-002 | Package scaffold                       | [Architecture](../architecture/activity-timeline-framework.md) · Package README (AT-002)                                                                              | 0033      |
| AT-003 | Activity Registry core                 | [Activity Registry spec](./SPR-007-ATF-activity-registry.md)                                                                                                          | 0034      |
| AT-004 | Timeline model & registry              | [Timeline model spec](./SPR-007-ATF-timeline-model.md)                                                                                                                | 0034      |
| AT-005 | Manifest bootstrap                     | [Bootstrap spec](./SPR-007-ATF-activity-bootstrap.md) · [Manifest schema](./SPR-007-ATF-activity-manifest.md)                                                         | 0034      |
| AT-006 | Server filter DTO                      | [Registry DTO spec](./SPR-007-ATF-activity-registry-dto.md)                                                                                                           | 0034      |
| AT-007 | Activity Mapping subscriber            | [ActivityItem model](./SPR-007-ATF-activity-document.md) · Mapper spec (AT-007)                                                                                       | 0035      |
| AT-008 | Activity Service API                   | [Service spec](./SPR-007-ATF-activity-service.md)                                                                                                                     | 0035      |
| AT-009 | Client hydration + hooks               | [Registry DTO](./SPR-007-ATF-activity-registry-dto.md) · [Client hydration](./SPR-007-ATF-activity-client-hydration.md)                                               | 0033      |
| AT-010 | Activity Presentation Layer            | [Presentation layer](./SPR-007-ATF-activity-presentation-layer.md)                                                                                                    | 0035      |
| AT-011 | Timeline Experiences                   | [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md)                                                                                                         | 0035      |
| AT-012 | Context Panel integration              | [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md) §Context Panel                                                                                          | 0035      |
| AT-013 | Application integration                | [Health endpoint](./SPR-007-ATF-health-endpoint-activities.md) · Bootstrap (M6 pattern)                                                                               | 0033      |
| AT-014 | E2E tests                              | [Diagnostics](./SPR-007-ATF-diagnostics.md) · E2E spec (AT-014)                                                                                                       | —         |
| AT-015 | Documentation & governance             | [Architecture](../architecture/activity-timeline-framework.md) · This index                                                                                           | —         |
| AT-016 | Production readiness review & closeout | [Milestone review](../reviews/MILESTONE-007-activity-timeline-framework-review.md) · [Closeout](../sprint/SPR-007-closeout.md)                                        | —         |
| AT-017 | Architecture review (superseded)       | [SPR-007-architecture-review.md](../reviews/SPR-007-architecture-review.md) — delivered AT-015                                                                        | —         |
| AT-018 | Sprint closeout (superseded)           | [SPR-007-closeout.md](../sprint/SPR-007-closeout.md) — delivered AT-016                                                                                               | —         |

---

## Taxonomy quick reference

### Activity categories

| Category    | Value         | Example activity type                      |
| ----------- | ------------- | ------------------------------------------ |
| User        | `user`        | `capability.theme.changed`                 |
| Team        | `team`        | `capability.plane.task.assigned` (planned) |
| Workspace   | `workspace`   | Workspace-scoped changes                   |
| System      | `system`      | `system.platform.bootstrap.completed`      |
| Security    | `security`    | `user.session.started`                     |
| Integration | `integration` | `integration.connector.sync.failed`        |
| Capability  | `capability`  | `capability.action.executed`               |

### Timeline scopes

| Scope     | Value       | SPR-007        |
| --------- | ----------- | -------------- |
| Personal  | `personal`  | ✅ Foundation  |
| Workspace | `workspace` | ✅ Scaffold    |
| System    | `system`    | Scaffold       |
| Team      | `team`      | Interface stub |

### Activity vs notification (same event)

|             | Notification         | Activity                   |
| ----------- | -------------------- | -------------------------- |
| Purpose     | Attention / delivery | Historical timeline        |
| Instance    | NotificationItem     | ActivityItem               |
| User action | Mark read            | Mark viewed                |
| Experience  | Badge, Panel         | Timeline feed, Context tab |

---

## Quality gates (all stories)

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e    # when UI/integration affected
```

AT-001 is documentation-only — gates must remain green.

---

## Related documents

| Document                 | Path                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Engineering backlog      | [SPR-007-activity-timeline-framework-backlog.md](../backlog/SPR-007-activity-timeline-framework-backlog.md)                   |
| Sprint guide             | [SPR-007-activity-timeline-framework.md](../sprint/SPR-007-activity-timeline-framework.md)                                    |
| Document 021             | [021-notification-activity-attention-management-framework.md](../021-notification-activity-attention-management-framework.md) |
| Platform 4.0 release     | [APZHUB-Platform-v4.0.md](../releases/APZHUB-Platform-v4.0.md)                                                                |
| M6 spec index (parallel) | [SPR-006-spec-index.md](./SPR-006-spec-index.md)                                                                              |

---

_SPR-007 Technical Specification Index — Milestone 7 complete (AT-016)._
