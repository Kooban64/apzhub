# SPR-006 — Event & Notification Framework

> **Sprint:** SPR-006  
> **Milestone:** 6 — Event & Notification Framework  
> **Status:** **EN-018 complete** — Milestone 6 closed; await owner approval before M7  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) · [SPR-006 backlog](../backlog/SPR-006-event-notification-framework-backlog.md)

---

## Initiative rename

At Milestone 6 planning, the initiative is formally named **Event & Notification Framework**. This supersedes the earlier roadmap label **Notification Framework** and reflects the dual deliverable:

1. **Event layer** — in-process Event Bus scaffold, Event Registry, standard envelope, publish/subscribe contracts (Document 029)
2. **Notification layer** — notification routing, attention management hooks, shell presentation (Document 021)

Modules **publish events**. Platform Services and the Notification Framework **determine notifications**. Modules never send notifications directly.

Story IDs use prefix **EN-** (Event & Notification), mirroring AF- and DF- conventions.

---

## Vision

APZHUB requires decoupled, auditable communication between platform capabilities without direct module-to-module calls. The Event & Notification Framework establishes:

- A **platform-owned Event Bus** for publish/subscribe with a standard envelope
- An **Event Registry** discovered from manifests and bootstrap
- A **Notification Registry** for routes, channels, and attention rules (scaffold)
- A **Notification Service** public API for shell and capability consumers
- **Notification Experiences** in the Desktop Shell (notification region, badge hooks)
- **Extension points** for Activity Framework (M7), audit, and future persistent bus

SPR-006 delivers foundation scaffolds — not full enterprise message queues, push notifications, or Activity timeline UI (M7).

---

## Objectives

1. Authorise implementation through ADRs and technical specifications (EN-001)
2. Establish `@apzhub/event-notification-framework` package (or ADR-approved split of `@apzhub/events` / `@apzhub/notifications` stubs) (EN-002)
3. Implement Event Registry and in-process Event Bus (EN-003–EN-006)
4. Implement Notification Registry, event-to-notification mapping, and Attention scaffold (EN-007–EN-009)
5. Deliver client hydration and Notification Service public API (EN-010–EN-011)
6. Deliver Notification Presentation Layer and shell Experience (EN-012–EN-013)
7. Wire Action Framework audit hook to Event Bus publish path (EN-014)
8. Application integration in `apps/web` (EN-015)
9. E2E verification (EN-016)
10. Documentation, governance, production readiness (EN-017)
11. Sprint closeout and milestone review (EN-018)

---

## Platform 3.0 constraints (non-negotiable)

- **No Runtime redesign** — Event bootstrap extends Manifest Engine via ADR; no orchestrator rewrite
- **No Workbench redesign** — notification region follows Surface Pattern; no engine bypass
- **No Action Framework executor changes** — audit hook publishes events; execution path unchanged
- **No Knowledge Framework changes** — optional future subscriber; no registry duplication
- **No parallel notification paths** — all shell notifications flow through Notification Service
- **Registry Pattern** — server bootstrap, permission filter, DTO hydration, read-only client ([Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md))
- **ADR for baseline exceptions** — Architecture Baseline v1.0 remains frozen

---

## Canonical layering

```text
Event Sources (manifests, Action audit, platform services)
        ↓
Event Registry
        ↓
Event Bus (in-process publish/subscribe)
        ↓
Notification Mappers / Subscribers
        ↓
Notification Registry
        ↓
Notification Service API
        ↓
Notification Presentation Layer
        ↓
Notification Experiences (shell region, badge)
```

Architecture reference (to be authored in EN-017): `docs/architecture/event-notification-framework.md`

---

## Architecture

### Architectural position

```text
Business Capabilities (M9+)
        │ publish business events via Platform Services
        ▼
Platform Capabilities
  Action Framework ✅          ── audit hook ──► Event Bus
  Knowledge & Discovery ✅     ── (future subscriber)
  Event & Notification (M6)    ◄── Sprint 006
        │
        ▼
Workbench Framework ✅
        │ shell notification region
        ▼
Platform Runtime ✅
        │ manifest discovery, bootstrap
        ▼
Foundation ✅
```

### Event Bus (SPR-006 scope)

| Aspect          | SPR-006 decision                                               |
| --------------- | -------------------------------------------------------------- |
| Transport       | In-process synchronous bus (Node + browser hydration boundary) |
| Envelope        | Standard fields per Document 029 §8                            |
| Persistence     | None — interface stub for future store                         |
| External broker | Out of scope — Redis/Kafka deferred to M10                     |
| Ordering        | Best-effort in-process; no global ordering guarantee           |

### Notification layer (SPR-006 scope)

| Aspect          | SPR-006 decision                                                       |
| --------------- | ---------------------------------------------------------------------- |
| Creation        | Platform Services / mappers subscribe to events; modules do not notify |
| Delivery        | In-memory notification queue per session (hydrated DTO)                |
| Channels        | In-app shell region only; email/push/mobile deferred                   |
| Attention       | Priority/badge scaffold; full Attention Engine deferred                |
| Preferences     | Interface stub referencing Document 023                                |
| Activity stream | Interface only — M7 Activity Framework                                 |

### Framework integration (Platform 3.0 → M6)

```text
Runtime.bootstrap()
        ↓
┌─────────────────┬──────────────────┬─────────────────────┐
│ Workbench Reg   │ Action Registry  │ Knowledge Registry  │
│ Event Registry  │ Notification Reg │ (existing M5)       │
└────────┬────────┴────────┬─────────┴──────────┬──────────┘
         │                 │                      │
         ▼                 ▼                      ▼
   Workbench API     ActionExecutor         Knowledge Service
         │                 │                      │
         │                 └── publish ──► Event Bus
         │                              │
         └──────── Notification Service ◄── mappers
                        │
                        ▼
                 Desktop Shell
         (actions + knowledge + notifications)
```

| From                 | To                      | Relationship                                   |
| -------------------- | ----------------------- | ---------------------------------------------- |
| Action Framework     | Event Bus               | `AuditHook.publish()` after successful execute |
| Event Bus            | Notification mappers    | Subscribe; create notification DTOs            |
| Notification Service | Shell Experience        | Read-only hydrated notifications               |
| Knowledge Service    | (future)                | Optional event subscriber for index refresh    |
| Workbench            | Notification Experience | Structural region; no direct Event Bus import  |

---

## Package structure

Planned package: `@apzhub/event-notification-framework` (EN-001 ADR may consolidate or split existing `@apzhub/events` and `@apzhub/notifications` stubs).

```text
packages/event-notification-framework/
  src/
    index.ts                    Public barrel
    types/                      Shared DTOs, envelope, result codes
    server/
      bootstrap/                bootstrapEventRegistry, bootstrapNotificationRegistry
      bus/                      InProcessEventBus, publish, subscribe
      registry/                 EventRegistry, NotificationRegistry
      filter/                   filterEventRegistryDto, filterNotificationRegistryDto
      mappers/                  EventToNotificationMapper (scaffold)
      hydration/                buildEventNotificationHydrationDto
    react/
      provider/                 EventNotificationProvider
      hooks/                    useEventRegistry, useNotificationService
      presentation/             mapNotificationDtoToViewModel
      experiences/              NotificationPanelExperience, NotificationBadgeExperience
    diagnostics/                EventNotificationDiagnostics
  package.json                  exports: . /server /react
```

**Export rules:** Same as KDF — server code in `/server`; React in `/react`; no apps/web imports from server paths on client.

---

## Registries

### Event Registry

| Field           | Purpose                                                  |
| --------------- | -------------------------------------------------------- |
| `eventId`       | Stable identifier (`domain.entity.action`)               |
| `version`       | Schema version                                           |
| `category`      | platform \| business \| user \| security \| …            |
| `publisher`     | Declaring service or capability                          |
| `subscribers`   | Declared interest (documentation + bootstrap validation) |
| `payloadSchema` | Zod or JSON schema reference                             |

Registration at server bootstrap from `event.yaml` manifests and built-in platform catalogue (action audit events).

### Notification Registry

| Field            | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `routeId`        | Notification route identifier              |
| `eventPattern`   | Event id or pattern subscription           |
| `channel`        | `in-app` (SPR-006 only)                    |
| `priority`       | attention tier scaffold                    |
| `templateRef`    | Presentation template key                  |
| `permissionKeys` | RBAC filter (keys declared; population M8) |

Follows Registry Pattern: registration server-side; client receives filtered DTO only.

---

## Providers

SPR-006 providers are **event publishers** and **notification mappers**, not knowledge-style projection providers:

| Provider                            | Role                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `PlatformEventCatalogueProvider`    | Built-in platform events (action executed, theme changed) |
| `ManifestEventProvider`             | Extract events from capability manifests                  |
| `ActionAuditEventPublisher`         | Bridge Action Framework audit hook → Event Bus            |
| `EventToNotificationMapperProvider` | Map subscribed events → notification DTOs                 |

Future providers (out of SPR-006): connector events, workflow events, AI recommendation events.

---

## DTOs

| DTO                                | Direction       | Contents                                  |
| ---------------------------------- | --------------- | ----------------------------------------- |
| `EventRegistryDto`                 | Server → client | Read-only event catalogue for diagnostics |
| `PlatformEventEnvelopeDto`         | Bus internal    | Standard envelope per Document 029        |
| `NotificationRegistryDto`          | Server → client | Routes, channels, templates (metadata)    |
| `NotificationHydrationDto`         | Server → client | Active notifications for session          |
| `EventNotificationHydrationBundle` | Server → client | Combined bootstrap payload                |

All DTOs immutable (`Object.freeze` or readonly types). No client-side registration.

---

## Hydration

Parallel to Action and Knowledge hydration in `apps/web`:

```text
Server layout / bootstrap
        ↓
bootstrapEventRegistry()
bootstrapNotificationRegistry()
filter*Dto(permissionAdapter)
        ↓
buildEventNotificationHydrationDto()
        ↓
Client EventNotificationProvider
        ↓
useNotificationService() / useEventRegistry()
```

Health endpoint extension: `/api/health` field `events` and `notifications` (counts, last bootstrap status).

---

## Service API

### NotificationService (public client boundary)

Planned methods (EN-011 spec):

| Method                        | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `listNotifications(options?)` | Active notifications for current actor     |
| `markRead(notificationId)`    | Mark single notification read              |
| `markAllRead()`               | Clear unread state                         |
| `subscribe(onChange)`         | In-process listener for Experience updates |
| `getDiagnostics()`            | Dev diagnostics snapshot                   |

Factory: `createNotificationServiceFromHydration(dto, options?)`

Hook: `useNotificationService()` — mandatory public API per governance (mirrors `useKnowledgeService()`).

### EventBusService (server + injected server-side)

| Method                        | Purpose                  |
| ----------------------------- | ------------------------ |
| `publish(envelope)`           | Publish after validation |
| `subscribe(eventId, handler)` | Register subscriber      |
| `unsubscribe(subscriptionId)` | Remove subscriber        |

Client does **not** publish business events directly in SPR-006 — client receives notification DTOs only. Event Bus runs server-side and in SSR bootstrap context.

---

## Presentation Layer

Location: `@apzhub/workspace` or `@apzhub/event-notification-framework/react/presentation`

Responsibilities:

- Map `NotificationHydrationDto` → view models (title, body, severity, timestamp, actionRef)
- Group by priority or date (scaffold)
- Format relative timestamps
- **No** event publishing or registry mutation

Follows Presentation Layer Pattern from [Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md).

---

## Experiences

| Experience                    | Surface                             | Enable flag (planned)     |
| ----------------------------- | ----------------------------------- | ------------------------- |
| `NotificationPanelExperience` | Shell notification region / popover | `enableNotificationPanel` |
| `NotificationBadgeExperience` | Header badge / attention indicator  | `enableNotificationBadge` |

Experiences consume `useNotificationService()` only. Action delegation uses existing `execute(actionRef)` — no new execution pipeline.

E2E hook (pattern from M5): query param or test-only prop for deterministic notification seed data.

---

## Health

| Check                           | Source                                 |
| ------------------------------- | -------------------------------------- |
| Event registry bootstrap        | `bootstrapEventRegistry` status        |
| Notification registry bootstrap | `bootstrapNotificationRegistry` status |
| Subscriber count                | In-process bus diagnostics             |
| Hydration                       | Client provider mounted                |

Extend `/api/health`:

```json
{
  "events": { "status": "ok", "registered": 12 },
  "notifications": { "status": "ok", "routes": 4, "active": 0 }
}
```

---

## Diagnostics

| Component                      | Audience      | Contents                                         |
| ------------------------------ | ------------- | ------------------------------------------------ |
| `EventNotificationDiagnostics` | Dev only      | Registry counts, recent publishes, mapper status |
| Server hydration diagnostics   | Logs / health | Bootstrap timing, filter stats                   |
| Event Bus trace                | Dev flag      | Last N envelopes (redacted payloads)             |

`data-testid="event-notification-diagnostics"` for E2E (EN-016).

Production operators use health endpoint — not dev-only UI.

---

## Bootstrap

Server sequence (extends existing `apps/web` bootstrap):

```text
Runtime.bootstrap()
        ↓
bootstrapActionRegistry()      (existing)
bootstrapKnowledgeRegistry()   (existing)
bootstrapEventRegistry()       (EN-004)
bootstrapNotificationRegistry() (EN-007)
        ↓
filter DTOs via permission adapter
        ↓
Parallel hydration to client providers
```

Manifest blocks (ADR in EN-001):

- `events:` — event declarations (Document 029)
- `notifications.routes:` — notification route declarations (Document 021 extension)

---

## Extension points

| Extension                     | SPR-006               | Future                          |
| ----------------------------- | --------------------- | ------------------------------- |
| Action audit → Event Bus      | ✅ Wire existing hook | Persistent audit store (M7/M10) |
| Event → Notification mapper   | ✅ Scaffold           | Rule engine, AI prioritisation  |
| Attention Engine              | Interface stub        | Full implementation post-M6     |
| Digest / quiet hours          | Interface stub        | Document 021 services           |
| Activity subscriber           | Interface stub        | M7 Activity Framework           |
| Knowledge re-index subscriber | Interface stub        | KDF provider refresh            |
| External Event Bus transport  | Not in scope          | Redis/NATS (M10)                |
| Push / email delivery         | Not in scope          | Delivery Service (M8+)          |

---

## Story status

| Story  | Title                             | Status                                       |
| ------ | --------------------------------- | -------------------------------------------- |
| EN-001 | Event & Notification Architecture | ✅ Complete                                  |
| EN-002 | Package scaffold                  | ✅ Complete                                  |
| EN-003 | EventRegistry core                | ✅ Complete                                  |
| EN-004 | In-process Event Bus              | ✅ Complete                                  |
| EN-005 | Manifest event bootstrap          | ✅ Complete                                  |
| EN-006 | Server filter DTO (events)        | ✅ Complete                                  |
| EN-007 | NotificationRegistry core         | ✅ Complete                                  |
| EN-008 | Notification route providers      | ✅ Complete                                  |
| EN-009 | Event-to-notification mappers     | ✅ Complete                                  |
| EN-010 | Client hydration + hooks          | ✅ Complete — await review before EN-011     |
| EN-011 | Notification Service API          | ✅ Complete — await review before EN-012     |
| EN-012 | Notification Presentation Layer   | ✅ Complete — await review before EN-013     |
| EN-013 | Notification shell Experiences    | ✅ Complete — await review before EN-014     |
| EN-014 | Action audit Event Bus wire       | ✅ Complete — await review before EN-015     |
| EN-015 | Application integration           | ✅ Complete                                  |
| EN-016 | E2E tests                         | ✅ Complete                                  |
| EN-017 | Documentation                     | ✅ Complete                                  |
| EN-018 | Sprint closeout                   | ✅ Complete — await owner approval before M7 |

Spec index (EN-001): [SPR-006-spec-index.md](../specs/SPR-006-spec-index.md)

---

## Quality gates

Every story must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

Platform 3.0 baseline at EN-001 gate: **872 tests**, **24 E2E tests**, **91.55%** coverage.

---

## Related documents

| Document              | Path                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Engineering backlog   | [SPR-006-event-notification-framework-backlog.md](../backlog/SPR-006-event-notification-framework-backlog.md) |
| Readiness review      | [SPR-006-readiness-review.md](../reviews/SPR-006-readiness-review.md)                                         |
| Platform v3.0 review  | [APZHUB-v3.0-Platform-Review.md](../reviews/APZHUB-v3.0-Platform-Review.md)                                   |
| Design patterns       | [APZHUB-Platform-Design-Patterns.md](../architecture/APZHUB-Platform-Design-Patterns.md)                      |
| Platform v3.0 release | [APZHUB-Platform-v3.0.md](../releases/APZHUB-Platform-v3.0.md)                                                |

---

**Stop condition:** EN-018 complete. Await owner approval before Milestone 7 planning.

_SPR-006 Event & Notification Framework Sprint Guide — Milestone 6 complete._
