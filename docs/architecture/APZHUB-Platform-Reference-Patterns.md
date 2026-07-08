# APZHUB Platform Reference Patterns

> **Platform Version:** 4.0  
> **Status:** **Authoritative architectural reference** for all platform frameworks  
> **Authority:** [Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md) · [Platform Governance](../governance/APZHUB-Platform-Governance.md) · [Platform v4.0](../releases/APZHUB-Platform-v4.0.md)  
> **Supersedes:** [APZHUB-Platform-Design-Patterns.md](./APZHUB-Platform-Design-Patterns.md) for Platform 4.0 onward — legacy doc retained for historical reference

---

## Purpose

This document defines the **canonical APZHUB platform patterns** proven across Milestones 2–6 and required for Milestone 7+. Every new framework must conform unless an accepted ADR documents an exception.

Patterns are derived from: `@apzhub/platform-runtime`, `@apzhub/workbench-framework`, `@apzhub/command-framework`, `@apzhub/knowledge-discovery-framework`, `@apzhub/event-notification-framework`.

---

## Canonical pipelines

### Knowledge & Discovery (M5)

```text
Knowledge Sources → Knowledge Registry → Knowledge Query API
→ Knowledge Service → Knowledge Presentation Layer → Knowledge Experiences
```

### Event & Notification (M6)

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

### Activity & Timeline (M7 — planned)

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences
```

**Rule:** Notification Mapping and Activity Mapping are **parallel Event Bus subscribers**. Neither consumes the other.

---

## Pattern index

| Pattern                                           | Primary frameworks                | Pipeline stage            |
| ------------------------------------------------- | --------------------------------- | ------------------------- |
| [Registry](#registry-pattern)                     | All                               | Index                     |
| [Bootstrap](#bootstrap-pattern)                   | Runtime, Action, Knowledge, ENF   | Server startup            |
| [Manifest](#manifest-pattern)                     | Runtime, all capabilities         | Declaration               |
| [DTO](#dto-pattern)                               | Workbench, Action, Knowledge, ENF | Transport                 |
| [Client Hydration](#client-hydration-pattern)     | All client frameworks             | Client startup            |
| [Service](#service-pattern)                       | Knowledge, ENF, ATF (planned)     | Public API                |
| [Provider](#provider-pattern)                     | Knowledge, ENF routes             | Projection / registration |
| [Presentation Layer](#presentation-layer-pattern) | Knowledge, ENF, workspace         | View models               |
| [Experience](#experience-pattern)                 | Action surfaces, Knowledge, ENF   | Shell UI                  |
| [Event](#event-pattern)                           | ENF                               | Publish                   |
| [Mapper](#mapper-pattern)                         | ENF, ATF (planned)                | Subscribe / transform     |
| [Diagnostics](#diagnostics-pattern)               | All                               | Dev observability         |
| [Health](#health-pattern)                         | Runtime, app                      | Operations                |
| [Integration](#integration-pattern)               | apps/web                          | Composition               |
| [Extension](#extension-pattern)                   | All                               | Future growth             |

---

## Registry Pattern

### Purpose

Maintain an authoritative in-memory index of platform metadata. Registries **register** — they do not **execute**.

### Responsibilities

- Accept normalised descriptors at bootstrap
- Validate identity, conflicts, and schema
- Expose read/query APIs and diagnostics
- Never perform user-facing execution or delivery

### Rules

- Server-side registration authority
- Atomic batch registration where required
- Conflict observability in diagnostics
- No client-side mutation after hydration
- Registration ≠ execution

### Lifecycle

```text
Declaration (manifest/catalogue) → bootstrap → register → filter → DTO map → client read-only view
```

### Typical implementation

`EventRegistry`, `NotificationRegistry`, `ActionRegistry`, `KnowledgeRegistry` — each with `register()`, `has()`, `getDiagnostics()`.

### Example

```text
bootstrapNotificationRegistry({ capabilityRecords })
        ↓
registerAppNotificationRoutes(registry)
        ↓
filterNotificationRegistryDto(registry, permissionAdapter)
```

### Common mistakes

- Storing executable handlers in registries
- Allowing UI components to register at runtime
- Skipping permission filter before DTO serialisation
- Using registry as a message queue

### Future applicability

Activity Registry, Timeline Registry (M7) — same bootstrap + filter + DTO chain.

---

## Bootstrap Pattern

### Purpose

Discover declarations from manifests and catalogues, validate, and populate registries during server startup.

### Responsibilities

- Scan capability records from Runtime
- Merge built-in catalogues with manifest extractions
- Fail-fast on invalid or conflicting declarations
- Emit bootstrap diagnostics

### Rules

- Runs server-side only (or SSR layout path)
- Idempotent where possible
- No React imports in bootstrap modules
- One bootstrap function per registry

### Lifecycle

```text
Runtime.bootstrap() → capability records → bootstrapXRegistry() → registered state
```

### Typical implementation

`bootstrapActionRegistry()`, `bootstrapEventRegistry()`, `bootstrapNotificationRegistry()`, `bootstrapKnowledgeRegistry()`.

### Example

```text
loadSharedEventNotificationContext()
  → createAppEventNotificationContext()
  → wireAppEventNotifications()
```

### Common mistakes

- Bootstrap in React components
- Partial bootstrap without diagnostics on failure
- Duplicate bootstrap across health and layout without shared cache

### Future applicability

`bootstrapActivityRegistry()`, `bootstrapTimelineRegistry()` (M7).

---

## Manifest Pattern

### Purpose

Make YAML manifests the **source of truth** for capability registration and platform extension.

### Responsibilities

- Declare ids, versions, permissions, and framework blocks
- Validate against Zod schemas in Manifest Engine
- Normalise to platform manifest envelope internally

### Rules

- Declare before implement
- Optional fields only for backward compatibility
- Breaking changes require ADR and schema version bump
- One stable id per declared entity

### Lifecycle

```text
Filesystem YAML → Discovery → Manifest Engine → Envelope → Registry bootstrap
```

### Typical implementation

`workbench.actions`, `workbench.navigation`, `knowledge.sources`, `events`, `notifications.routes` blocks.

### Example

```yaml
workbench:
  actions:
    - id: example.action.demo
      permission: example.action.demo
      handler: workbench-bridge:workbench.navigation.reveal
```

### Common mistakes

- Hardcoding navigation or actions in `apps/web`
- Manifest ids that do not match handler/bridge ids
- Missing permission keys on navigable items

### Future applicability

`activities.types`, `timelines.scopes` manifest blocks (M7 — ADR-gated).

---

## DTO Pattern

### Purpose

Serialise registry state into **versioned, permission-filtered** payloads for client hydration.

### Responsibilities

- Map internal registry → transport shape
- Apply permission filter server-side
- Carry `schemaVersion` and framework metadata
- Remain immutable after creation

### Rules

- Never send raw registry to client
- Filter before serialisation
- Validate at client boundary
- DTOs are read-only projections

### Lifecycle

```text
Registry → mapXRegistryDto() → filterXRegistryDto() → serialise → client provider
```

### Typical implementation

`ActionRegistryDto`, `EventRegistryDto`, `NotificationRegistryDto`, `KnowledgeSourceRegistryDto`.

### Example

```text
filterActionRegistryDto(dto, permissionAdapter)  // server layout
        ↓
CommandRegistryProvider(dto={filtered})           // client
```

### Common mistakes

- Client-side permission filtering as authority
- Mutating DTO after creation
- Omitting schema version on breaking shape changes

### Future applicability

`ActivityRegistryDto`, `TimelineRegistryDto` (M7).

---

## Client Hydration Pattern

### Purpose

Deliver server-filtered DTOs and shared service instances to React providers without client-side registration authority.

### Responsibilities

- Load DTOs in RSC layout or server helpers
- Mount framework providers in composition root
- Wire shared executors/services once per session
- Expose hooks for Experiences

### Rules

- Hydration is read-only — no runtime registry mutation
- Server authority for permissions
- Parallel hydration loads acceptable; document duplicate work as tech debt
- Dev diagnostics optional; hidden in production

### Lifecycle

```text
Server: load*Hydration() / load*Dto()
        ↓
Client: *Provider(dto, service)
        ↓
Experiences: use*Service() / use*Presentation()
```

### Typical implementation

`ActionWorkbenchShellProvider` — Workbench + Command + Knowledge + Notification providers.

### Example

```text
(platform)/layout
  loadEventNotificationHydration()
        ↓
ActionWorkbenchShellProvider
  NotificationRegistryProvider + NotificationServiceProvider
```

### Common mistakes

- Fetching registries client-side from APIs not designed for it
- Multiple Notification Service instances per tree
- Hydration without permission filter

### Future applicability

`ActivityDiscoveryProvider`, `ActivityServiceProvider` (M7).

---

## Service Pattern

### Purpose

Provide the **public client boundary** for framework read/update operations — hiding orchestrators, mappers, and stores.

### Responsibilities

- Expose stable methods and subscribe/notify semantics
- Enforce session or actor scoping
- Return diagnostics for dev/test
- Never publish domain events (unless explicitly an event publisher service — not notification/activity services)

### Rules

- Experiences consume Service — not internal stores
- One service instance per session context where applicable
- Immutable read models returned to UI
- `getDiagnostics()` mandatory

### Lifecycle

```text
Bootstrap context → createService() → Provider → hook → Experience
```

### Typical implementation

`DefaultNotificationService`, `KnowledgeService` via `createKnowledgeServiceFromHydration()`.

### Example

```typescript
// Experiences
const { unreadCount, viewModels } = useNotificationPresentation();
const { markRead } = useNotificationService();
```

### Common mistakes

- Experiences importing mapper or Event Bus directly
- Service methods that publish events as side effect of read operations
- Duplicate service instances breaking subscribe sync

### Future applicability

`ActivityService` — list timeline entries, mark viewed, subscribe (M7).

---

## Provider Pattern

### Purpose

Register **projections** or **route metadata** that translate upstream registries or manifests into framework-specific documents or routes.

### Responsibilities

- Reference upstream ids — do not duplicate definitions
- Project read-only content (Knowledge) or declare routes (Notification)
- Register at bootstrap with stable provider/source ids

### Rules

- Providers do not replace Action or Workbench registries
- No execution in provider code
- Permission awareness via upstream DTO filter

### Lifecycle

```text
Upstream DTO → registerProvider() → registry.hasProvider() → consumer query
```

### Typical implementation

`ActionRegistryKnowledgeProvider`, `WorkbenchNavigationKnowledgeProvider`, notification route registration.

### Example

```text
Action Registry DTO → ActionRegistryKnowledgeProvider → KnowledgeDocument[] (actionRef)
```

### Common mistakes

- Embedding full action handlers in knowledge documents
- Providers that mutate upstream registries
- Notification providers that publish events

### Future applicability

Activity type providers projecting manifest **`activities.types`** (M7).

---

## Presentation Layer Pattern

### Purpose

Transform service read models into **UI-ready view models** — grouping, labels, timestamps, severity — without execution or side effects.

### Responsibilities

- Pure mapping functions and hooks
- Grouping and sorting for lists
- Relative time formatting with injectable `now` for tests
- No Event Bus, no Service mutation

### Rules

- Presentation is pure — no I/O
- Hooks compose mappers; do not bypass Service
- Keep in framework package or `@apzhub/workspace` helpers consistently per framework ADR

### Lifecycle

```text
Service read model → mapToViewModel() → group/sort → Experience render
```

### Typical implementation

`mapNotificationItemToViewModel()`, `groupNotificationsByPriority()`, `formatNotificationRelativeTimestamp()`.

### Example

```typescript
useNotificationPresentation(); // viewModels, groups, unreadCount
```

### Common mistakes

- Formatting in Experience components ad hoc
- Presentation layer calling `markRead` (belongs in Experience → Service)
- Skipping grouping spec for list UIs

### Future applicability

`mapActivityItemToViewModel()`, timeline grouping by day/actor (M7).

---

## Experience Pattern

### Purpose

Render shell UI regions that consume Presentation Layer hooks and delegate actions through existing execution pipelines.

### Responsibilities

- Mount in DesktopShell or Workbench regions
- Call Service for mutations; Presentation for display
- Use design system components
- Expose `data-testid` for E2E

### Rules

- No registry mutation
- No Event Bus import
- No parallel execution pipeline
- Enable flags on shell (`enableNotificationBadge`, etc.)

### Lifecycle

```text
Shell flags → Experience mount → hooks → user interaction → Service / execute()
```

### Typical implementation

`NotificationBadgeExperience`, `NotificationPanelExperience`, Command Palette, Knowledge Overlay.

### Example

```text
DesktopShell enableNotificationPanel
  → WorkbenchNotifications
  → NotificationPanelExperience
```

### Common mistakes

- Inline notification creation in Experience
- Direct `eventBus.publish` from UI
- Visible debug panels in production

### Future applicability

Timeline feed Experience, Context panel Activity tab (M7).

---

## Event Pattern

### Purpose

Represent **domain state changes** as immutable envelopes published to the platform Event Bus.

### Responsibilities

- Declare events in catalogue or manifest
- Validate envelope against Event Registry
- Publish from capabilities or audit hooks after successful operations
- Carry category, correlationId, payload, timestamp

### Rules

- Events ≠ notifications ≠ activity records
- Client does not publish business events (M6 scope)
- One primary category per platform catalogue event
- Failed operations do not publish audit events (Action pattern)

### Lifecycle

```text
Successful operation → buildEnvelope() → eventBus.publish() → subscribers
```

### Typical implementation

`capability.action.executed` via `createActionAuditEventBusHook`.

### Example

```text
DefaultActionExecutor.execute() ok
  → audit hook → capability.action.executed
  → Notification Mapper + (future) Activity Mapper
```

### Common mistakes

- Using notifications as events
- Publishing from mapper or notification service
- Skipping registry validation

### Future applicability

Business capability events (M9+); persistent event store (M8/M10) behind same envelope.

---

## Mapper Pattern

### Purpose

Subscribe to Event Bus and **transform envelopes** into framework artefacts (NotificationItems, ActivityItems) without publishing events.

### Responsibilities

- Match event patterns to registry routes/types
- Render templates or map fields
- Hand off to Service `add*()` methods
- Report mapping issues non-fatally where appropriate

### Rules

- Subscribers only — never publishers
- Independent mappers for Notification vs Activity
- Template/route registration in registry — not hardcoded in mapper unless catalogue

### Lifecycle

```text
eventBus.subscribe(mapper) → envelope → map() → service.addItems()
```

### Typical implementation

`DefaultNotificationMapper`, `wireAppEventNotifications()`.

### Example

```text
capability.action.executed
  → routes: inbox + toast
  → NotificationService.addNotifications()
```

### Common mistakes

- Mapper calling `eventBus.publish`
- Activity mapper writing to Notification Service
- Single mega-mapper without route registry

### Future applicability

`DefaultActivityMapper` (M7) — parallel subscriber, separate store.

---

## Diagnostics Pattern

### Purpose

Expose structured, machine-readable snapshots for development, E2E, and troubleshooting — **hidden in production UI**.

### Responsibilities

- `getDiagnostics()` on subsystems and services
- Hidden DOM `data-testid` hooks in dev/test only
- Guard with `NODE_ENV=production` where rendered in React
- No visible debug panels in product shell

### Rules

- Diagnostics ≠ health (health is operator-facing API)
- Never expose secrets in diagnostic payloads
- Per-surface diagnostics when multiple Experiences exist (`data-surface`)

### Lifecycle

```text
Implementation → getDiagnostics() → dev component OR test assertion
```

### Typical implementation

`event-notification-diagnostics`, `notification-diagnostics`, `ActionFrameworkDiagnostics`.

### Example

```html
<div data-testid="event-notification-diagnostics" hidden ... />
```

### Common mistakes

- Visible aside panels in production
- Diagnostics that mutate state when read
- Duplicate testids without scoping (strict mode failures)

### Future applicability

`activity-timeline-diagnostics` (M7).

---

## Health Pattern

### Purpose

Aggregate operator-facing status via `/api/health` and Runtime health providers.

### Responsibilities

- Summarise registry counts, service status, subscriber counts
- Extend health route incrementally per framework
- Mirror hydration summaries where practical

### Rules

- Health fields are summaries — not full DTOs
- Server-side computation
- Stable JSON shape with typed summaries in `@apzhub/types`

### Lifecycle

```text
load*HealthSummary() → health route → operator poll
```

### Typical implementation

`/api/health` fields: `runtime`, `commands`, `knowledge`, `events`, `notifications`.

### Example

```json
{
  "events": { "subscriberCount": 1, "layerStatus": "audit" },
  "notifications": { "mapperStatus": "ready", "unreadCount": 0 }
}
```

### Common mistakes

- Client-only health that omits server bootstrap failures
- Reloading full hydration stack on every health poll without cache
- Using health as a generic REST API for clients

### Future applicability

`/api/health` `activities` field (M7).

---

## Integration Pattern

### Purpose

Wire all frameworks in `apps/web` as the **single composition root** without leaking integration into package internals.

### Responsibilities

- Server: runtime init, parallel hydration loaders, health builders
- Client: shell provider stacking shared contexts
- Audit hooks and subscribers wired once
- E2E test hooks env-gated

### Rules

- `apps/web` may import all packages; packages must not import `apps/web`
- Production wiring distinct from test-only helpers (`wireNotificationMapperToService` test-only vs `wireAppEventNotifications` production)
- Memoize hooks that would otherwise cause render loops

### Lifecycle

```text
instrumentation → runtime-init → layout hydration → shell provider → shell UI
```

### Typical implementation

`action-workbench-shell-provider.tsx`, `create-app-event-notification-context.ts`.

### Example

```text
createActionAuditEventBusHook + wireAppEventNotifications
  → single EventNotificationContext
  → Notification Experiences
```

### Common mistakes

- Framework package importing Next.js APIs
- Test helpers enabled in production env
- Separate server/client service instances assumed to share state

### Future applicability

`wireAppActivityTimeline()` (M7) — parallel to notification wiring.

---

## Extension Pattern

### Purpose

Define stable extension points for future milestones without redesigning existing frameworks.

### Responsibilities

- Document interfaces and stubs for deferred capabilities
- Register scaffold strategies/routes/channels without activating UI
- ADR before changing public contracts

### Rules

- Extend via new subscribers, routes, providers — not forks
- Stubs return `NOT_IMPLEMENTED` or no-op with diagnostics
- Milestone scope explicit in backlog out-of-scope sections

### Lifecycle

```text
Interface/stub in M_N → product milestone activates → ADR if contract change
```

### Typical implementation

Gateway stubs (AI, voice), email/SMS/push notification channels, ranking strategy scaffolds.

### Example

Notification route `channel: email` registered; Delivery Service deferred M8+.

### Common mistakes

- Implementing M8+ scope inside M6 stories
- Breaking stub interfaces when activating features
- Extension via Experience bypassing Service

### Future applicability

WebSocket activity feed transport, persistent timeline store, team scope timelines (M7+).

---

## Applying patterns to a new framework (checklist)

1. ADR for package boundary and public API
2. Registry + bootstrap + filter + DTO
3. Service as public boundary; orchestration internal
4. Presentation Layer pure transforms
5. Experiences in `@apzhub/workspace` or dedicated package per ADR
6. Integration in `apps/web` only
7. Health + diagnostics + E2E spec
8. Developer onboarding + governance update at documentation story

---

## Related documents

| Document                                                                                 | Topic                    |
| ---------------------------------------------------------------------------------------- | ------------------------ |
| [APZHUB-Platform-Design-Patterns.md](./APZHUB-Platform-Design-Patterns.md)               | Historical v3.0 patterns |
| [APZHUB-Platform-Reference-Architecture.md](./APZHUB-Platform-Reference-Architecture.md) | Layer consolidation      |
| [event-notification-onboarding.md](../developer/event-notification-onboarding.md)        | ENF developer guide      |
| [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md)                 | M7 planning              |

---

_APZHUB Platform Reference Patterns — Platform Version 4.0._
