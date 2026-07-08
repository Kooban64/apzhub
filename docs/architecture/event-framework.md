# Event Framework — Architecture

> **Subsystem:** Event Framework (Event & Notification Framework — Event layer)  
> **Platform Version:** 3.0 baseline · SPR-006 foundation  
> **Status:** Architecture — **EN-017 complete** (EN-003–EN-016 implementation delivered)  
> **Authority:** [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [ADR-0030](../adr/ADR-0030-event-notification-framework-package.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md) · [Event Architecture Spec](../specs/SPR-006-ENF-event-architecture.md)

---

## Purpose

The **Event Framework** is the platform layer responsible for **declaring, registering, publishing, and dispatching platform events** through a platform-owned Event Bus.

Events enable loose coupling between capabilities. Events are **not** notifications, audit logs, or activity records — though those subsystems may **subscribe** to events as independent consumers.

**EN-001 scope:** Architecture and taxonomy. **Implementation:** EN-003–EN-016 (Event Registry, Event Bus, audit hook, app integration, E2E verification).

---

## Architectural principle

```text
Platform Capability
        ↓
Domain Event (conceptual state change)
        ↓
Event Bus
        ↓
Subscribers (Notification Mapping · Activity · Audit · Search · …)
```

| Rule                         | Meaning                     |
| ---------------------------- | --------------------------- |
| Capabilities publish events  | After successful operations |
| Event Bus is platform-owned  | Not module-to-module calls  |
| Notifications consume events | Never the reverse           |
| Client does not publish      | Server authority in SPR-006 |

---

## Position in platform stack

```text
Business Capabilities (M9+)
        │ publish domain events via Platform Services
        ▼
Platform Capabilities
  Action Framework ✅ ── audit hook ──► Event publish (EN-014)
  Knowledge & Discovery ✅ ── (optional future subscriber)
  Event Framework (M6) ◄── Event Registry · Event Bus
        │
        ▼
Platform Runtime ✅ ── manifest discovery · bootstrap
        ▼
Foundation ✅
```

The Event Framework sits in **Platform Capabilities** — peer to Action and Knowledge frameworks. It does not replace Runtime bootstrap; it extends manifest extraction and server composition.

---

## Canonical layering (Event layer)

```text
Event Sources (manifests · platform catalogue · audit hook)
        ↓
Event Registry
        ↓
In-Process Event Bus
        ↓
Event Subscribers (notification mappers · future audit/activity/search)
```

| Layer          | Responsibility                  | Executes?         |
| -------------- | ------------------------------- | ----------------- |
| Event Sources  | Declare and trigger publish     | Publish only      |
| Event Registry | Index registered event metadata | No                |
| Event Bus      | Validate envelope · dispatch    | No business logic |
| Subscribers    | React independently             | Domain-specific   |

---

## Event taxonomy

Four **canonical categories** for APZHUB platform engineering. Every registered event declares exactly one primary category.

### System Events (`system`)

Platform infrastructure and lifecycle — no user business meaning.

| Example event id                      | Publisher        | Payload summary                      |
| ------------------------------------- | ---------------- | ------------------------------------ |
| `system.platform.bootstrap.completed` | platform-runtime | bootstrap duration, capability count |
| `system.platform.health.degraded`     | platform-runtime | subsystem id, status                 |
| `system.registry.conflict.detected`   | platform-runtime | registry id, conflict type           |
| `system.session.expired`              | auth             | session id, user id                  |

### User Events (`user`)

Authenticated user actions, preferences, and session behaviour.

| Example event id          | Publisher           | Payload summary              |
| ------------------------- | ------------------- | ---------------------------- |
| `user.session.started`    | auth                | user id, workspace id        |
| `user.preference.changed` | preferences-service | key, scope                   |
| `user.workspace.switched` | workbench-framework | from workspace, to workspace |
| `user.signout.completed`  | auth                | user id                      |

### Capability Events (`capability`)

Domain state changes from platform or business capabilities. Primary category for module-published events.

| Example event id                    | Publisher           | Payload summary               |
| ----------------------------------- | ------------------- | ----------------------------- |
| `capability.action.executed`        | command-framework   | action id, actor, result code |
| `capability.theme.changed`          | theme-service       | theme id                      |
| `capability.navigation.opened`      | workbench-framework | route id, workspace id        |
| `capability.example.record.created` | example-capability  | record id (M9+)               |

### Integration Events (`integration`)

Connector and adapter state changes — external system boundaries.

| Example event id                       | Publisher           | Payload summary            |
| -------------------------------------- | ------------------- | -------------------------- |
| `integration.connector.sync.started`   | integration-adapter | connector id, job id       |
| `integration.connector.sync.completed` | integration-adapter | connector id, record count |
| `integration.connector.sync.failed`    | integration-adapter | connector id, error code   |
| `integration.webhook.received`         | integration-gateway | source, event type         |

### Document 029 extended categories

Additional values (`security`, `infrastructure`, `notification`, `ai`, `business`) remain valid for registration when a more specific category is required. The four categories above are the **APZHUB canonical set** for sprint stories and platform catalogue entries.

Full taxonomy: [SPR-006-ENF-event-architecture.md](../specs/SPR-006-ENF-event-architecture.md) §4.

---

## Core components (implemented)

| Component              | Package path                                   | Story  |
| ---------------------- | ---------------------------------------------- | ------ |
| EventRegistry          | `server/event/event-registry.ts`               | EN-003 |
| InProcessEventBus      | `server/event/in-process-event-bus.ts`         | EN-004 |
| bootstrapEventRegistry | `server/bootstrap/bootstrap-event-registry.ts` | EN-005 |
| filterEventRegistryDto | `server/filter/filter-event-registry-dto.ts`   | EN-006 |
| PlatformEventCatalogue | `server/catalogue/platform-events.ts`          | EN-005 |
| Action audit publisher | `integration/action-audit-event-publisher.ts`  | EN-014 |

---

## Standard envelope

Every dispatch uses **PlatformEventEnvelope** — see [SPR-006-ENF-event-envelope.md](../specs/SPR-006-ENF-event-envelope.md).

Key fields: `envelopeId`, `eventId`, `eventVersion`, `category`, `correlationId`, `causationId`, `timestamp`, `publisher`, `payload`.

---

## Registry Pattern compliance

1. **Declaration** — manifest `events` block or `event.yaml`
2. **Server bootstrap** — `bootstrapEventRegistry()` extracts and registers
3. **Permission filter** — route metadata filtered before client DTO (EN-006)
4. **DTO serialisation** — read-only `EventRegistryDto` for diagnostics
5. **No client publish** — Event Bus server-only in SPR-006

---

## Relationship to Notification Framework

```text
Event Bus dispatch
        ↓
Notification Mapping (Notification Framework)
        ↓
Notification Service
        ↓
Notification Presentation Layer
        ↓
Notification Experiences
```

The Event Framework **does not** create notifications. It provides the dispatch mechanism. See [notification-framework.md](./notification-framework.md).

---

## Deferred capabilities

| Capability                | Target              |
| ------------------------- | ------------------- |
| Persistent event store    | M7/M10              |
| External broker transport | M10                 |
| Event replay              | M10                 |
| Client event stream       | Not planned SPR-006 |
| Full audit persistence    | M7 Activity / M10   |

---

## Related documents

| Document                                                                        | Topic                    |
| ------------------------------------------------------------------------------- | ------------------------ |
| [notification-framework.md](./notification-framework.md)                        | Notification layer       |
| [event-notification-framework.md](./event-notification-framework.md)            | Combined overview        |
| [SPR-006-ENF-event-architecture.md](../specs/SPR-006-ENF-event-architecture.md) | Full event specification |
| [SPR-006-ENF-event-envelope.md](../specs/SPR-006-ENF-event-envelope.md)         | Envelope contract        |
| [SPR-006-ENF-event-manifest.md](../specs/SPR-006-ENF-event-manifest.md)         | Manifest schema          |

---

_Event Framework Architecture — EN-017._
