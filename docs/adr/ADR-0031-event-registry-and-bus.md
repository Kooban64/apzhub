# ADR-0031 — Event Registry and In-Process Event Bus

> **Status:** Accepted  
> **Date:** 2026-07-03  
> **Sprint:** SPR-006 — EN-001  
> **Decided by:** Project owner (Sprint 006 authorisation)  
> **Related:** [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [ADR-0030](./ADR-0030-event-notification-framework-package.md) · [Event Framework](../architecture/event-framework.md)

## Problem

Platform 3.0 has no runtime Event Bus. Action Framework exposes an audit hook stub (ADR-0026). Document 029 mandates a platform-owned Event Bus with standard envelopes, manifest-first event declarations, and subscriber rules.

Sprint 006 must decide:

1. Where events are registered (Event Registry vs inline publish)
2. Transport for SPR-006 (in-process vs external broker)
3. Who may publish (modules, services, platform capabilities)
4. Event taxonomy alignment with Document 029 categories

## Decision

### Event Registry

All publishable events **must** register in **EventRegistry** at server bootstrap before `publish()` is permitted.

| Property        | Description                                           |
| --------------- | ----------------------------------------------------- |
| `eventId`       | Stable dot-notation id (`capability.action.executed`) |
| `version`       | Schema version string                                 |
| `category`      | Canonical taxonomy category (ADR-0031 § Taxonomy)     |
| `publisher`     | Declaring capability or service id                    |
| `subscribers`   | Declared interest (documentation + validation)        |
| `payloadSchema` | Zod schema reference or inline schema                 |

Registration follows Registry Pattern — server authority; optional read-only `EventRegistryDto` for client diagnostics only.

### Standard envelope

Every published event uses **PlatformEventEnvelope** per Document 029 §8:

```typescript
interface PlatformEventEnvelope {
  readonly envelopeId: string; // unique publish instance
  readonly eventId: string; // registered event id
  readonly eventVersion: string;
  readonly category: EventCategory;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string; // ISO-8601
  readonly publisher: string;
  readonly actorId?: string;
  readonly sourceService?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}
```

Unregistered `eventId` publish attempts **fail** with structured error — fail-fast per ADR-0013 spirit.

### In-process Event Bus (SPR-006)

**InProcessEventBus** is the sole transport in SPR-006:

- Synchronous dispatch in Node bootstrap / server action context
- Subscriber isolation — one subscriber failure does not block others
- No persistence, replay, or ordering guarantees beyond single-process best-effort
- `EventBusTransport` interface stub for future Redis/NATS adapter (M10)

External broker is **explicitly deferred**.

### Publish authority

| Publisher type         | May publish | Rule                                            |
| ---------------------- | ----------- | ----------------------------------------------- |
| Platform Capability    | ✅          | After successful operation completion           |
| Platform Service       | ✅          | Per Document 027 — business events after commit |
| Action audit hook      | ✅          | After successful `execute()` — EN-014           |
| Notification subsystem | ❌          | **Notifications never generate events**         |
| Client / React         | ❌          | No client publish in SPR-006                    |
| Module direct call     | ❌          | Must publish event, not call notification code  |

### Event taxonomy (canonical — SPR-006)

Four **primary categories** for APZHUB platform engineering (maps to Document 029 superset):

| Category           | `category` value | Description                                       |
| ------------------ | ---------------- | ------------------------------------------------- |
| System Events      | `system`         | Platform health, bootstrap, lifecycle             |
| User Events        | `user`           | Authenticated user actions and preferences        |
| Capability Events  | `capability`     | Domain events from platform/business capabilities |
| Integration Events | `integration`    | Connector state changes and sync outcomes         |

Document 029 additional categories (`security`, `infrastructure`, `notification`, `ai`) remain valid extension values — registered with explicit `category` field. SPR-006 implements catalogue entries for all four primary categories.

See [Event Taxonomy](../specs/SPR-006-ENF-event-architecture.md) §4 for examples.

### Domain Event vs Platform Event

| Term               | Meaning                                                   |
| ------------------ | --------------------------------------------------------- |
| **Domain Event**   | Business-meaningful state change declared by a capability |
| **Platform Event** | Envelope-wrapped, registered, bus-dispatched instance     |

Flow:

```text
Platform Capability completes operation
        ↓
Domain Event (conceptual)
        ↓
PlatformEventEnvelope.publish()
        ↓
InProcessEventBus dispatches to subscribers
```

### Manifest registration

Canonical declaration paths (both supported — EN-005 specifies extraction):

```yaml
# Inline in capability manifest
events:
  - id: capability.example.created
    version: "1.0.0"
    category: capability
    publisher: example-capability
    subscribers: [notifications, audit]
    payload:
      exampleId: string
```

```yaml
# Standalone event.yaml (Document 029)
event:
  id: ProjectCreated
  version: 1.0.0
  category: capability
  publisher: project-service
  subscribers: [notifications, activity, audit]
  payload:
    projectId: uuid
```

Normalisation to internal `RegisteredEvent` at bootstrap.

## Alternatives

| Alternative                   | Why rejected                                        |
| ----------------------------- | --------------------------------------------------- |
| Publish without registration  | No discoverability; breaks manifest-first principle |
| Redis/Kafka in SPR-006        | Premature; in-process sufficient for current scale  |
| Client Event Bus              | Security; inconsistent server authority             |
| Notification-triggered events | Violates Document 021; inverted dependency          |

## Consequences

- EN-003 implements EventRegistry; EN-004 implements InProcessEventBus
- EN-005 wires manifest extraction; EN-006 adds DTO filter
- EN-014 connects Action audit hook as first live publisher
- Knowledge Framework may add event subscriber post-M6 without ADR unless API changes
- Persistent store and replay documented as extension — not implemented

---

_ADR-0031 — Event Registry and In-Process Event Bus — Accepted at EN-001._
