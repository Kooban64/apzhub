# SPR-007 — Activity & Timeline Framework

> **Sprint:** SPR-007  
> **Milestone:** 7 — Activity & Timeline Framework  
> **Status:** **Closed** — Milestone 7 complete; await owner approval before Milestone 8 planning  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [Platform 4.0](../releases/APZHUB-Platform-v4.0.md) · [SPR-007 backlog](../backlog/SPR-007-activity-timeline-framework-backlog.md)

---

## Initiative rename

At Milestone 7 planning, the initiative is formally named **Activity & Timeline Framework**. This supersedes the earlier roadmap label **Activity Framework** and reflects the dual deliverable:

1. **Activity layer** — event-to-activity mapping, Activity Registry, Activity Service, in-session activity store (Document 021 §6–§8)
2. **Timeline layer** — Timeline Registry, personal/team/workspace timeline models, shell presentation (Document 021 §7–§8, Document 016 Context Panel)

Platform capabilities **publish events**. The Activity & Timeline Framework **records and presents activity** from those events. Modules never write activity records directly.

Story IDs use prefix **AT-** (Activity & Timeline), mirroring AF-, DF-, and EN- conventions.

---

## Vision

APZHUB requires a unified, permission-aware view of what happened across the platform — personal work history, team collaboration signals, and workspace-scoped timelines — without coupling to notification delivery or audit persistence.

The Activity & Timeline Framework establishes:

- An **Activity Registry** for activity types, templates, and presentation metadata
- A **Timeline Registry** for timeline scopes (`timeline.personal`, `timeline.team`, `timeline.organization`, `timeline.system`)
- **Event-to-activity mapping subscribers** on the existing Event Bus (parallel to notification mappers)
- An **Activity Service** public API for shell and capability consumers
- **Activity Presentation Layer** mapping DTOs to timeline view models
- **Timeline Experiences** in the Desktop Shell (activity feed, context panel tab)
- **Extension points** for persistent activity store, real-time transport, and audit alignment (deferred)

SPR-007 delivers foundation scaffolds — not a full audit framework, not notification routing, not an event store, and not external real-time brokers.

---

## Objectives

1. Authorise implementation through ADRs and technical specifications (AT-001)
2. Establish `@apzhub/activity-timeline-framework` package (AT-002)
3. Implement Activity Registry and Timeline Registry (AT-003–AT-004)
4. Implement manifest bootstrap and permission-filtered DTOs (AT-005–AT-006)
5. Implement Activity Mapping subscriber on Event Bus (AT-007)
6. Deliver Activity Service public API (AT-008)
7. Deliver client hydration and hooks (AT-009)
8. Deliver Activity Presentation Layer and Timeline Experiences (AT-010–AT-011)
9. Integrate Context Panel activity tab (AT-012)
10. Application integration in `apps/web` (AT-013)
11. E2E verification (AT-014)
12. Documentation and governance (AT-015)
13. Production readiness review (AT-016)
14. Architecture review preparation (AT-017)
15. Sprint closeout and milestone review (AT-018)

---

## What this framework is not

| Concern                    | Relationship to SPR-007                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| **Audit framework**        | Out of scope — Activity items may reference source events; immutable audit store deferred to M8+ |
| **Notification framework** | Independent — parallel Event Bus subscriber; does not route or deliver notifications             |
| **Event store**            | Consumer of Platform Events only — no event persistence, replay, or bus redesign                 |
| **Attention Engine**       | Interface stub only — full attention rules remain Document 021 / M8+                             |
| **Delivery Service**       | Out of scope — email, push, webhook deferred                                                     |

Modules publish events. Platform Services may enrich payloads. Activity & Timeline **subscribes** and **presents** — it does not publish business events or send notifications.

---

## Platform 4.0 constraints (non-negotiable)

- **No Runtime redesign** — activity bootstrap extends Manifest Engine via ADR; no orchestrator rewrite
- **No Workbench redesign** — timeline surfaces follow Surface Pattern; Context Panel tab is additive
- **No Action Framework executor changes** — existing audit hook continues publishing events; no execution path change
- **No Knowledge Framework changes** — optional future subscriber; no registry duplication
- **No Event & Notification Framework changes** — Activity Mapping is a **new parallel subscriber**; notification mappers unchanged
- **Registry Pattern** — server bootstrap, permission filter, DTO hydration, read-only client ([Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md))
- **ADR for baseline exceptions** — Architecture Baseline v1.0 remains frozen; Platform 4.0 is the active engineering baseline

---

## Locked architectural decisions (owner approved)

These decisions are **locked** for all SPR-007 documentation and implementation.

### Manifest schema

Use **`activities.types`** as the canonical manifest block — consistent with `workbench.actions`, `knowledge.sources`, and `notifications.routes`. Do **not** use `activity.types`.

### Default timeline scope

Default scope identifier: **`timeline.personal`**.

Reserved scope identifiers (documentation and registry stubs until later stories):

| Scope id                | Status               |
| ----------------------- | -------------------- |
| `timeline.personal`     | Default — foundation |
| `timeline.team`         | Reserved             |
| `timeline.organization` | Reserved             |
| `timeline.system`       | Reserved             |

### Permissions

The Activity Framework **must not** implement its own RBAC. It consumes the existing platform **Permission Adapter**. The Activity Service receives **only permission-filtered data**.

### Deduplication

Activity deduplication is **optional**. Default behaviour: **no deduplication**. Future mappers may optionally declare an idempotency strategy — extension point only (see extension-points spec).

### UI placement

Activity Timeline is an **independent Workbench Experience**. It is **not** notification history, notification inbox, or a notification tab. Notifications remain transient communication; activity is historical context.

### Bootstrap

Bootstrap registers **platform activity types only**. Business activity types belong in capability manifests (`activities.types` blocks).

---

## Canonical pipeline

```text
Platform Capability
        ↓
Domain Event (standard envelope — Document 029)
        ↓
Event Bus (existing — @apzhub/event-notification-framework)
        ↓
Activity Mapping (parallel subscriber — not notification path)
        ↓
Activity Service
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences (shell feed, context panel tab)
```

**Parallel subscribers on Event Bus:**

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

Notification delivery and activity presentation are **independent**. A single domain event may produce zero, one, or both outcomes — determined by separate registries and mappers.

Architecture reference: [activity-timeline-framework.md](../architecture/activity-timeline-framework.md) (AT-001)

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
  Event & Notification (M6) ✅ ◄── Event Bus + Notification layer
  Activity & Timeline (M7)     ◄── Sprint 007 — parallel subscriber
        │
        ▼
Workbench Framework ✅
        │ Context Panel · shell timeline region
        ▼
Platform Runtime ✅
        │ manifest discovery, bootstrap
        ▼
Foundation ✅
```

### Activity layer (SPR-007 scope)

| Aspect          | SPR-007 decision                                                               |
| --------------- | ------------------------------------------------------------------------------ |
| Creation        | `EventToActivityMapper` subscribes to Event Bus; modules do not write activity |
| Storage         | In-memory activity store per session (hydrated DTO) — no persistent SoR        |
| Correlation     | Activity items retain `eventId`, `correlationId`, `causationId` from envelope  |
| Permissions     | Activity and timeline DTOs filtered server-side; client read-only              |
| Audit alignment | Presentation references source events; dedicated audit store deferred          |

### Timeline layer (SPR-007 scope)

| Aspect             | SPR-007 decision                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Scopes             | `timeline.personal`, `timeline.team`, `timeline.organization`, `timeline.system` (registry-defined) |
| Default experience | Personal timeline in Context Panel; workspace feed scaffold                                         |
| Grouping           | By date, category, actor (presentation layer)                                                       |
| Real-time          | Interface stub for WebSocket/SSE — no transport in SPR-007                                          |
| Team subscriptions | Registry metadata + filter scaffold; full Subscription Service deferred                             |

### Framework integration (Platform 4.0 → M7)

```text
Runtime.bootstrap()
        ↓
┌─────────────────┬──────────────────┬─────────────────────┬────────────────────┐
│ Workbench Reg   │ Action Registry  │ Knowledge Registry  │ Event / Notif Reg  │
│ Activity Reg    │ Timeline Reg     │ (existing M5–M6)    │                    │
└────────┬────────┴────────┬─────────┴──────────┬──────────┴──────────┬─────────┘
         │                 │                      │                     │
         ▼                 ▼                      ▼                     ▼
   Workbench API     ActionExecutor         Knowledge Service      Event Bus
         │                 │                      │                     │
         │                 └── publish ───────────┴─────────────────────┤
         │                                                              │
         │                    ┌─────────────────────────────────────────┤
         │                    ▼                                         ▼
         │            Activity Mapper                          Notification Mapper
         │                    │                                         │
         └──────── Activity Service ◄──────────────────── Notification Service
                        │
                        ▼
                 Desktop Shell
         (actions + knowledge + notifications + timelines)
```

| From                      | To                   | Relationship                                                      |
| ------------------------- | -------------------- | ----------------------------------------------------------------- |
| Event Bus                 | Activity mapper      | Subscribe; create activity DTOs (parallel to notification mapper) |
| Event Bus                 | Notification mapper  | Unchanged — M6 path                                               |
| Activity Service          | Timeline Experiences | Read-only hydrated activities                                     |
| Activity Service          | Context Panel tab    | Timeline scope selection                                          |
| Action Framework          | Event Bus            | Existing audit publish — no change                                |
| Workbench Context Manager | Timeline Experience  | Structural tab; no direct Event Bus import                        |

---

## Package structure

Planned package: `@apzhub/activity-timeline-framework`

```text
packages/activity-timeline-framework/
  src/
    index.ts                    Public barrel
    types/                      Shared DTOs, activity item, timeline scope, result codes
    server/
      bootstrap/                bootstrapActivityRegistry, bootstrapTimelineRegistry
      registry/                 ActivityRegistry, TimelineRegistry
      filter/                   filterActivityRegistryDto, filterTimelineRegistryDto
      mappers/                  EventToActivityMapper (subscriber)
      store/                    InMemoryActivityStore (per-session)
      hydration/                buildActivityTimelineHydrationDto
    react/
      provider/                 ActivityTimelineProvider
      hooks/                    useActivityRegistry, useTimelineRegistry, useActivityService
      presentation/             mapActivityDtoToViewModel, groupActivitiesByDate
      experiences/              PersonalTimelineExperience, WorkspaceActivityFeedExperience
    diagnostics/                ActivityTimelineDiagnostics
  package.json                  exports: . /server /react
```

**Export rules:** Same as ENF and KDF — server code in `/server`; React in `/react`; no `apps/web` imports from server paths on client.

---

## Activity Registry

| Field                | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `activityTypeId`     | Stable identifier (`domain.entity.activity`)                     |
| `version`            | Schema version                                                   |
| `category`           | `user` \| `team` \| `system` \| `security` \| `integration` \| … |
| `sourceEventPattern` | Event id or pattern that produces this activity type             |
| `timelineScopes`     | Which timeline scopes may display this type                      |
| `templateRef`        | Presentation template key                                        |
| `permissionKeys`     | RBAC filter (keys declared; population M8)                       |
| `retentionHint`      | Presentation retention tier (not persistence policy)             |

Registration at server bootstrap from `activity.yaml` manifests and built-in platform activity catalogue (action executed, capability registered).

---

## Timeline Registry

| Field                | Purpose                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `timelineId`         | Stable identifier — default `timeline.personal`; reserved `timeline.team`, `timeline.organization`, `timeline.system` |
| `scope`              | Scope id matching locked identifiers                                                                                  |
| `scope`              | `timeline.personal` \| `timeline.team` \| `timeline.organization` \| `timeline.system`                                |
| `label`              | User-facing name (not backend terminology)                                                                            |
| `activityTypeFilter` | Allowed activity types or patterns                                                                                    |
| `sortOrder`          | Default chronological direction                                                                                       |
| `permissionKeys`     | Visibility filter                                                                                                     |
| `experienceRef`      | Shell experience binding                                                                                              |

Follows Registry Pattern: registration server-side; client receives filtered DTO only.

---

## Event subscribers

SPR-007 subscribers are **activity mappers** — not notification mappers, not audit writers:

| Subscriber                          | Role                                                     |
| ----------------------------------- | -------------------------------------------------------- |
| `EventToActivityMapper`             | Subscribe on Event Bus; map envelopes → activity DTOs    |
| `PlatformActivityCatalogueProvider` | Built-in activity types (action executed, theme changed) |
| `ManifestActivityProvider`          | Extract activity declarations from capability manifests  |

**Rules:**

- Subscribe via existing `InProcessEventBus` — no bus fork
- Subscriber failure isolated (same semantics as EN-004)
- Idempotent mapping where duplicate delivery occurs (Document 029)
- No publish from Activity layer — consumer only

Future subscribers (out of SPR-007): connector activity, workflow steps, knowledge index activity, persistent activity projection worker.

---

## DTOs

| DTO                               | Direction       | Contents                              |
| --------------------------------- | --------------- | ------------------------------------- |
| `ActivityRegistryDto`             | Server → client | Read-only activity type catalogue     |
| `TimelineRegistryDto`             | Server → client | Timeline scopes and metadata          |
| `ActivityItemDto`                 | Server → client | Single activity record (immutable)    |
| `ActivityHydrationDto`            | Server → client | Active activities for session / scope |
| `ActivityTimelineHydrationBundle` | Server → client | Combined bootstrap payload            |

Activity item fields (planned):

| Field            | Purpose                            |
| ---------------- | ---------------------------------- |
| `activityId`     | Unique activity instance id        |
| `activityTypeId` | Registry reference                 |
| `eventId`        | Source event reference             |
| `correlationId`  | End-to-end trace (Document 010)    |
| `timestamp`      | Occurrence time (ISO 8601)         |
| `actorRef`       | Who performed action (platform id) |
| `summary`        | User-facing one-line description   |
| `detailRef`      | Optional deep-link or action ref   |
| `timelineScopes` | Applicable scopes                  |
| `metadata`       | Redacted presentation metadata     |

All DTOs immutable (`Object.freeze` or readonly types). No client-side registration.

---

## Hydration

Parallel to Action, Knowledge, and Event/Notification hydration in `apps/web`:

```text
Server layout / bootstrap
        ↓
bootstrapActivityRegistry()
bootstrapTimelineRegistry()
filter*Dto(permissionAdapter)
        ↓
buildActivityTimelineHydrationDto()
        ↓
Client ActivityTimelineProvider
        ↓
useActivityService() / useActivityRegistry() / useTimelineRegistry()
```

Health endpoint extension: `/api/health` fields `activities` and `timelines` (counts, last bootstrap status).

---

## Activity Service

### ActivityService (public client boundary)

Planned methods (AT-008 spec):

| Method                       | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `listActivities(options?)`   | Activities for scope (personal, workspace, team) |
| `getActivity(activityId)`    | Single activity by id                            |
| `subscribe(scope, onChange)` | In-process listener for Experience updates       |
| `getTimelineScopes()`        | Available timelines for current actor            |
| `getDiagnostics()`           | Dev diagnostics snapshot                         |

Factory: `createActivityServiceFromHydration(dto, options?)`

Hook: `useActivityService()` — mandatory public API per governance (mirrors `useNotificationService()`, `useKnowledgeService()`).

### Server-side activity store

| Aspect      | SPR-007 decision                                                 |
| ----------- | ---------------------------------------------------------------- |
| Location    | `server/store/in-memory-activity-store.ts`                       |
| Scope       | Per-session / per-bootstrap context                              |
| Persistence | None — interface stub for M8+                                    |
| Population  | EventToActivityMapper writes; client reads via hydration refresh |

Client does **not** create activity records in SPR-007.

---

## Presentation Layer

Location: `@apzhub/activity-timeline-framework/react/presentation`

Responsibilities:

- Map `ActivityItemDto` → view models (summary, actor label, relative timestamp, icon, severity)
- Group by date (today, yesterday, this week)
- Filter by timeline scope
- Format actor and entity references using platform terminology (Document 002)
- **No** event publishing, registry mutation, or notification creation

Follows Presentation Layer Pattern from [Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md).

---

## Timeline Experiences

| Experience                        | Surface                               | Enable flag (planned)         |
| --------------------------------- | ------------------------------------- | ----------------------------- |
| `PersonalTimelineExperience`      | Context Panel activity tab            | `enablePersonalTimeline`      |
| `WorkspaceActivityFeedExperience` | Workspace auxiliary region (scaffold) | `enableWorkspaceActivityFeed` |

Experiences consume `useActivityService()` only. Deep-link and action delegation use existing `execute(actionRef)` — no new execution pipeline.

E2E hook (pattern from M5/M6): query param or test-only prop for deterministic activity seed data.

---

## Health

| Check                       | Source                             |
| --------------------------- | ---------------------------------- |
| Activity registry bootstrap | `bootstrapActivityRegistry` status |
| Timeline registry bootstrap | `bootstrapTimelineRegistry` status |
| Mapper subscriber status    | Activity mapper diagnostics        |
| Hydration                   | Client provider mounted            |

Extend `/api/health`:

```json
{
  "activities": { "status": "ok", "types": 8, "active": 0 },
  "timelines": { "status": "ok", "scopes": 3 }
}
```

---

## Diagnostics

| Component                     | Audience      | Contents                                     |
| ----------------------------- | ------------- | -------------------------------------------- |
| `ActivityTimelineDiagnostics` | Dev only      | Registry counts, recent mappings, store size |
| Server hydration diagnostics  | Logs / health | Bootstrap timing, filter stats               |
| Activity mapper trace         | Dev flag      | Last N mapped events (redacted payloads)     |

`data-testid="activity-timeline-diagnostics"` for E2E (AT-014).

Production operators use health endpoint — not dev-only UI.

---

## Bootstrap

Server sequence (extends existing `apps/web` bootstrap):

```text
Runtime.bootstrap()
        ↓
bootstrapActionRegistry()           (existing)
bootstrapKnowledgeRegistry()        (existing)
bootstrapEventRegistry()            (existing — M6)
bootstrapNotificationRegistry()     (existing — M6)
bootstrapActivityRegistry()         (AT-005)
bootstrapTimelineRegistry()         (AT-005)
        ↓
register EventToActivityMapper on Event Bus (AT-007)
        ↓
filter DTOs via permission adapter
        ↓
Parallel hydration to client providers
```

Manifest blocks (ADR in AT-001):

- `activities:` — activity type declarations (Document 021 extension)
- `timelines:` — timeline scope declarations

---

## Extension points

| Extension                   | SPR-007                 | Future                                   |
| --------------------------- | ----------------------- | ---------------------------------------- |
| Event → Activity mapper     | ✅ Scaffold             | Rule engine, AI summarisation            |
| Personal timeline UI        | ✅ Context Panel tab    | Full workspace feeds                     |
| Team timeline subscriptions | Registry scaffold       | Subscription Service (Document 021)      |
| Real-time activity push     | Interface stub          | WebSocket/SSE (M8+)                      |
| Persistent activity store   | Interface stub          | PostgreSQL projection (M8+)              |
| Audit store alignment       | Reference source events | Dedicated audit framework                |
| Notification correlation    | Interface stub          | Cross-link activity ↔ notification in UI |
| Knowledge re-index activity | Interface stub          | KDF subscriber                           |
| External activity sources   | Not in scope            | Connector activity (M9+)                 |

---

## Engineering rules

1. **One story at a time** — complete acceptance criteria and owner review before next story
2. **Spec before code** — every AT-002+ story implements an existing `SPR-007-ATF-*` specification
3. **Consumer-only Activity layer** — no publish from Activity Mapping or Activity Service
4. **Parallel to notifications** — no writes to Notification Service; no ENF package changes
5. **Registry Pattern** — server bootstrap, permission filter, DTO hydration, read-only client
6. **Public API hooks** — Experiences use `useActivityService()` / `useActivityPresentation()` only
7. **No Event Bus in UI** — Timeline Experiences must not import Event Bus or mapper internals
8. **ADR for baseline exceptions** — Platform 4.0 frozen; changes require accepted ADR
9. **Quality gates** — lint, typecheck, build, test, coverage, E2E (when UI/integration affected)

---

## Story sequence

```text
AT-001 Architecture (ADRs + specs) ✅
    ↓
AT-002 Package scaffold
    ↓
AT-003 Activity Registry ── AT-004 Timeline Registry
    ↓
AT-005 Manifest bootstrap ── AT-006 Server filter DTO
    ↓
AT-007 Activity Mapping subscriber
    ↓
AT-008 Activity Service API
    ↓
AT-009 Client hydration + hooks
    ↓
AT-010 Presentation Layer
    ↓
AT-011 Timeline Experiences ── AT-012 Context Panel tab
    ↓
AT-013 Application integration (apps/web)
    ↓
AT-014 E2E verification
    ↓
AT-015 Documentation ── AT-016 Production readiness ── AT-017 Architecture review ── AT-018 Closeout
```

---

## Future roadmap (post–SPR-007)

| Capability                                        | Sprint | Notes                                    |
| ------------------------------------------------- | ------ | ---------------------------------------- |
| Persistent activity store (PostgreSQL projection) | M8+    | Interface stub in AT-008                 |
| Real-time push (WebSocket/SSE)                    | M8+    | Transport interface stub                 |
| Team subscription service                         | M8+    | Registry scaffold only in M7             |
| Audit framework alignment                         | M8+    | Reference source events; not audit store |
| Attention Engine rules                            | M8+    | Document 021 deferred                    |
| Connector / workflow activity sources             | M9+    | External event sources                   |
| AI summarisation of activity groups               | Future | Extension point in presentation layer    |

---

## Story outline

| Story  | Title                                  | Status      |
| ------ | -------------------------------------- | ----------- |
| AT-001 | Activity & Timeline Architecture       | ✅ Complete |
| AT-002 | Package scaffold                       | ✅ Complete |
| AT-003 | Activity Registry core                 | ✅ Complete |
| AT-004 | Timeline model & registry              | ✅ Complete |
| AT-005 | Manifest bootstrap                     | ✅ Complete |
| AT-006 | Server filter DTO                      | ✅ Complete |
| AT-007 | Activity Mapping subscriber            | ✅ Complete |
| AT-008 | Activity Service API                   | ✅ Complete |
| AT-009 | Client hydration + hooks               | ✅ Complete |
| AT-010 | Activity Presentation Layer            | ✅ Complete |
| AT-011 | Timeline Experiences                   | ✅ Complete |
| AT-012 | Context Panel integration              | ✅ Complete |
| AT-013 | Application integration                | ✅ Complete |
| AT-014 | E2E tests                              | ✅ Complete |
| AT-015 | Documentation & governance             | ✅ Complete |
| AT-016 | Production readiness review & closeout | ✅ Complete |

Spec index: [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md) · Closeout: [SPR-007-closeout.md](./SPR-007-closeout.md) · Completion report: [AT-016-completion-report.md](./AT-016-completion-report.md)

---

## Quality gates

Every story must pass:

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI/integration affected
```

Platform 4.0 baseline at AT-015 gate: **1308 tests**, **36 E2E tests**, **≥80%** ATF coverage threshold.

---

## Related documents

| Document                          | Path                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Engineering backlog               | [SPR-007-activity-timeline-framework-backlog.md](../backlog/SPR-007-activity-timeline-framework-backlog.md)           |
| Spec index                        | [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md)                                                               |
| Sprint closeout                   | [SPR-007-closeout.md](./SPR-007-closeout.md)                                                                          |
| Milestone review                  | [MILESTONE-007-activity-timeline-framework-review.md](../reviews/MILESTONE-007-activity-timeline-framework-review.md) |
| Release notes                     | [v0.7.0-activity-timeline-framework.md](../releases/v0.7.0-activity-timeline-framework.md)                            |
| ADR-0033 – 0035                   | [adr/README.md](../adr/README.md)                                                                                     |
| Platform 4.0 release              | [APZHUB-Platform-v4.0.md](../releases/APZHUB-Platform-v4.0.md)                                                        |
| Event & Notification architecture | [event-notification-framework.md](../architecture/event-notification-framework.md)                                    |
| Design patterns                   | [APZHUB-Platform-Design-Patterns.md](../architecture/APZHUB-Platform-Design-Patterns.md)                              |
| Platform roadmap                  | [platform-roadmap.md](../architecture/platform-roadmap.md)                                                            |

---

**Stop condition:** Milestone 7 complete. Await owner approval before Milestone 8 planning.

_SPR-007 Activity & Timeline Framework Sprint Guide — Milestone 7 closed (AT-016)._
