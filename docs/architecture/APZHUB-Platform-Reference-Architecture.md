# APZHUB Platform Reference Architecture

> **Platform Version:** 5.0  
> **Status:** Master architectural reference — consolidation only, no redesign  
> **Authority:** [Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md) · [Document 000](../000-apzhub-engineering-constitution.md) · [Platform v5.0](../releases/APZHUB-Platform-v5.0.md)  
> **Change control:** Baseline modifications require ADR. This document consolidates Platform 5.0 (M1–M7); it does not supersede the frozen baseline.

---

## Purpose

This document is the **master architectural reference** for APZHUB Platform Version 5.0. It consolidates Runtime, Workbench, Action Framework, Knowledge & Discovery Framework, Event & Notification Framework, Activity & Timeline Framework, capability model, Platform Assets, registry pattern, Workbench surfaces, execution pipelines, API layering, diagnostics, package boundaries, and dependency rules into a single navigable reference.

Future milestones **consume** this architecture. They do not redesign it.

---

## Platform vision

APZHUB is an Enterprise Operating Platform — one unified workbench for enterprise capabilities. Backend systems are implementation details hidden behind Platform Services, connectors, and manifests.

---

## Layer model

Dependencies flow **downward only**. Higher layers consume lower layers. Lower layers never depend on higher layers.

```text
┌─────────────────────────────────────────────────────────────┐
│              Future Business Capabilities (M9+)                │
│    Manifests · Platform Services · Product validation streams  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│     Platform Identity, Administration & UX (M8 — planned)      │
│    PermissionService · RBAC admin · Preferences persistence    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Platform Capabilities (M4–M7) ✅                    │
│    Action ✅ · Knowledge ✅ · Event/Notification ✅ · Activity ✅  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Workbench Framework (M3) ✅                   │
│    @apzhub/workbench-framework                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Platform Runtime (M2) ✅                      │
│    @apzhub/platform-runtime · UI-agnostic                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Foundation (M1) ✅                            │
│    @apzhub/ui · @apzhub/workspace · @apzhub/auth · apps/web    │
└─────────────────────────────────────────────────────────────┘
```

### Platform capability stack (M4–M7)

Dependencies flow **downward** through Workbench and Runtime. Platform capabilities are **siblings** — they do not import each other's internal modules.

```text
Platform Runtime
        ↓
Workbench Framework
        ↓
Action Framework
        ↓
Knowledge & Discovery Framework
        ↓
Event & Notification Framework
        ↓
Activity & Timeline Framework
        ↓
Future Business Capabilities (M9+)
```

Action Framework is listed first among platform capabilities because it is the primary **execution** and **event publication** path. Knowledge, Event/Notification, and Activity/Timeline are **parallel consumers** of registries and Event Bus — not sequential dependencies between themselves.

---

## Platform Runtime

**Package:** `@apzhub/platform-runtime`  
**Entry:** `Runtime.bootstrap()` from `@apzhub/platform-runtime/server`

### Responsibilities

| Subsystem             | Responsibility                                                               |
| --------------------- | ---------------------------------------------------------------------------- |
| Orchestrator          | Configuration → Discovery → Manifest → Graph → Registry → Lifecycle → Health |
| Manifest Engine       | Zod validation, envelope normalisation                                       |
| Discovery Engine      | Scan configured roots for YAML manifests                                     |
| Dependency Graph      | Topological sort, cycle detection                                            |
| Capability Registry   | In-memory index; kind-specific getters                                       |
| Lifecycle Manager     | State machine: discovered → active                                           |
| Health Manager        | Pluggable health providers                                                   |
| Configuration Manager | Env-source only; no scattered `process.env`                                  |

### Rules

- **UI-agnostic** — no React, `@apzhub/ui`, `@apzhub/workspace`
- **Fail-fast** — invalid manifests block bootstrap (ADR-0013)
- **Internal API** — no Registry REST (ADR-0010)
- **Diagnostics mandatory** — every subsystem exposes `getDiagnostics()`

### Application integration

| File                               | Role                               |
| ---------------------------------- | ---------------------------------- |
| `apps/web/lib/runtime-init.ts`     | Cached `Runtime.bootstrap()`       |
| `apps/web/app/api/health/route.ts` | Runtime summary in health response |

**Deep dive:** [platform-runtime.md](./platform-runtime.md) · [runtime-orchestrator.md](./runtime-orchestrator.md)

---

## Workbench Framework

**Package:** `@apzhub/workbench-framework`  
**Public API:** `WorkbenchAPI`, `useWorkbenchAPI()`, Workbench Requests

### Architecture

```text
Capability / Shell
        │ Workbench Requests
        ▼
Workbench API ──► Request Bus ──► Workbench Manager
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
        Navigation Engine        View Engine              Session Engine
        Layout Engine            Panel Engine             Context Engine
                                                        Selection Engine
              │                         │                         │
              └─────────────────────────┴─────────────────────────┘
                                        ▼
                              Presentation Adapters → @apzhub/ui
```

### Engines

| Engine     | Owns                         |
| ---------- | ---------------------------- |
| Layout     | Region geometry, dock splits |
| Panel      | Visibility, collapse, resize |
| Navigation | Workspaces, sidebar model    |
| View       | Active view, routes          |
| Session    | Persist/restore snapshots    |
| Context    | Context panel state          |
| Selection  | Per-view selection           |

**Rule:** Engines do not call each other. Manager coordinates.

### Permission integration

```text
Runtime.registry()
        ↓
filterWorkbenchRegistryDto(dto, permissionAdapter)   [server]
        ↓
WorkbenchProvider → Navigation/View hydration       [client]
```

### Session

- Store: `localStorage` key `apzhub:workbench:session:{userId}`
- Schema: versioned JSON (`1.0`)
- Restore sanitisation against permission adapter

**Deep dive:** [workbench-framework.md](./workbench-framework.md) · [workbench-manager.md](./workbench-manager.md)

---

## Action Framework

**Package:** `@apzhub/command-framework`  
**Exports:** `@apzhub/command-framework`, `/server`, `/react`

### Subsystems

| Subsystem              | Role                                                 |
| ---------------------- | ---------------------------------------------------- |
| ActionRegistry         | Action descriptors; search; context filter           |
| DefaultActionExecutor  | Permission, dispatch, audit, actor routing           |
| WorkbenchCommandBridge | Bridge id → `WorkbenchAction`                        |
| ShortcutRegistry       | Chord normalisation; conflict detection              |
| Server bootstrap       | `bootstrapActionRegistry`, `filterActionRegistryDto` |
| Client hydration       | `createCommandRegistryFromDto`, read-only registry   |
| Gateways               | AI, voice, automation stubs                          |

### Application integration (M4)

```text
(platform)/layout [RSC]
  loadWorkbenchRegistryDto() + loadActionRegistryDto()

ActionWorkbenchShellProvider
  WorkbenchProvider(resolveActionExecutor)
    CommandRegistryProvider(dto, shared ActionExecutor)
      DesktopShell (palette, shortcuts, context menu, toolbar)
```

**Deep dive:** [command-framework.md](./command-framework.md)

---

## Knowledge & Discovery Framework

**Package:** `@apzhub/knowledge-discovery-framework`  
**Exports:** `@apzhub/knowledge-discovery-framework`, `/server`, `/react`  
**Status:** `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS = "service"`

### Canonical layering

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API (internal)
        ↓
Knowledge Service          ← useKnowledgeService() [public]
        ↓
Knowledge Presentation Layer   (@apzhub/workspace)
        ↓
Knowledge Experiences
```

### Subsystems

| Subsystem                      | Role                                                    |
| ------------------------------ | ------------------------------------------------------- |
| KnowledgeRegistry              | Source + provider registration; validation; metadata    |
| KnowledgeProvider              | Projects upstream DTOs → `KnowledgeDocument` references |
| KnowledgeDiscoveryOrchestrator | Multi-provider query, merge, dedupe                     |
| RankingEngine                  | Keyword + fuzzy strategies; scaffold registry           |
| KnowledgeService               | Public client boundary wrapping internal query client   |
| Client hydration               | `KnowledgeDiscoveryProvider`, `useKnowledgeRegistry()`  |

### Providers (M5)

| Provider                             | Source id             | Projects                                      |
| ------------------------------------ | --------------------- | --------------------------------------------- |
| ActionRegistryKnowledgeProvider      | `platform.actions`    | Action Registry DTO → command documents       |
| WorkbenchNavigationKnowledgeProvider | `platform.navigation` | Workbench Registry DTO → navigation documents |

Providers return **references** (`actionRef`, `navigation`) — not executable handlers.

### Application integration (M5)

```text
(platform)/layout [RSC]
  loadKnowledgeSourceRegistryDto() + parallel command/workbench DTOs

ActionWorkbenchShellProvider
  KnowledgeDiscoveryProvider(dto, service=useAppKnowledgeService(...))
    DesktopShell (commandPaletteMode, enableCommandPalette)
    KnowledgeDiscoveryDiagnostics [dev/test only]
```

Health: `/api/health` → `knowledge` field via `loadKnowledgeHealthSummary()`.

### Interaction with Action Framework

```text
Knowledge Experience selects command document
        ↓
delegateKnowledgeOverlaySelection()
        ↓
useCommandRegistry().execute(actionId)
        ↓
DefaultActionExecutor → WorkbenchCommandBridge
```

No parallel execution pipeline ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

### Interaction with Workbench Framework

```text
Knowledge Experience selects navigation document
        ↓
activateViewForRoute(target)
        ↓
Workbench Request Bus → Navigation / View engines
```

**Deep dive:** [knowledge-discovery-framework.md](./knowledge-discovery-framework.md)

---

## Event & Notification Framework

**Package:** `@apzhub/event-notification-framework`  
**Exports:** `@apzhub/event-notification-framework`, `/server`, `/react`  
**Status:** `EVENT_NOTIFICATION_SERVER_STATUS = "integration"` · `EVENT_NOTIFICATION_REACT_STATUS = "integration"`

### Canonical layering

```text
Platform Capability
        ↓
Domain Event
        ↓
Event Bus
        ↓
Notification Mapping
        ↓
Notification Service          ← useNotificationService() [public]
        ↓
Notification Presentation Layer
        ↓
Notification Experiences
```

### Subsystems

| Subsystem                  | Role                                       |
| -------------------------- | ------------------------------------------ |
| EventRegistry              | Event metadata index; envelope validation  |
| InProcessEventBus          | Synchronous publish/subscribe              |
| NotificationRegistry       | Route metadata; templates; channels        |
| DefaultNotificationMapper  | Event Bus subscriber → NotificationItem    |
| DefaultNotificationService | Session store; list; mark read; subscribe  |
| Presentation helpers       | View models, grouping, relative timestamps |

### Application integration (M6)

```text
(platform)/layout [RSC]
  loadEventNotificationHydration()

ActionWorkbenchShellProvider
  NotificationRegistryProvider + NotificationServiceProvider (shared context)
  createActionAuditEventBusHook → Event Bus
  wireAppEventNotifications() → mapper → service
    DesktopShell (enableNotificationBadge, enableNotificationPanel)
    EventNotificationDiagnostics [dev/test only]
```

Health: `/api/health` → `events` + `notifications` fields.

### Interaction with Action Framework

```text
DefaultActionExecutor.execute() success
        ↓
createActionAuditEventBusHook → capability.action.executed
        ↓
DefaultNotificationMapper → NotificationService
        ↓
NotificationBadgeExperience + NotificationPanelExperience
```

Audit hook does **not** change executor dispatch path.

### Independence from Activity & Timeline (M7)

Activity Mapping subscribes to the **same Event Bus** as Notification Mapping. Neither mapper publishes events or writes to the other's service.

**Deep dive:** [event-notification-framework.md](./event-notification-framework.md)

---

## Activity & Timeline Framework

**Package:** `@apzhub/activity-timeline-framework`  
**Exports:** `@apzhub/activity-timeline-framework`, `/server`, `/react`  
**Status:** `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "experiences"`

### Canonical layering

```text
Platform Capability
        ↓
Domain Event
        ↓
Event Bus
        ↓
Activity Mapping
        ↓
Activity Service          ← ActivityTimelineService [public]
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences
        ↓
Context Panel
```

### Subsystems

| Subsystem                    | Role                                            |
| ---------------------------- | ----------------------------------------------- |
| ActivityRegistry             | Activity type metadata; event pattern binding   |
| TimelineRegistry             | Timeline scope descriptors                      |
| DefaultEventToActivityMapper | Event Bus subscriber → ActivityDocument         |
| DefaultActivityService       | Session store; listActivities; queryTimeline    |
| Presentation helpers         | View models, date grouping, relative timestamps |

### Application integration (M7)

```text
(platform)/layout [RSC]
  loadActivityTimelineHydration()

ActionWorkbenchShellProvider
  ActivityTimelineProvider + ActivityTimelineServiceProvider
  wireAppActivityTimeline() → mapper → service (shared Event Bus)
    DesktopShell (enableActivityTimeline, enableActivityTimelinePanel)
    ActivityTimelineDiagnostics [dev/test only]
```

Health: `/api/health` → `activities` + `timelines` fields.

### Interaction with Action Framework and Event Bus

```text
DefaultActionExecutor.execute() success
        ↓
createActionAuditEventBusHook → capability.action.executed
        ↓
        ├─► DefaultNotificationMapper → NotificationService → Badge/Panel
        └─► DefaultEventToActivityMapper → ActivityService → Context Panel Timeline
```

Same event. Parallel fan-out. No cross-service writes.

**Deep dive:** [activity-timeline-framework.md](./activity-timeline-framework.md)

---

## Framework integration (Platform 5.0)

```text
                    Runtime.bootstrap()
                            │
        ┌───────────────────┼───────────────────┬───────────────────┬──────────────┐
        ▼                   ▼                   ▼                   ▼              ▼
 Workbench Registry   Action Registry    Knowledge Registry   Event + Notif.   Activity +
        │                   │                   │              Registries + Bus  Timeline
        ▼                   ▼                   ▼                   ▼              ▼
 WorkbenchProvider   CommandRegistry    KnowledgeDiscovery   Notification     ActivityTimeline
        │              Provider               Provider         Providers        Providers
        │                   │                   │                   │              │
        │                   │ publish           │                   │ subscribe    │ subscribe
        │                   └───────────────────┴───────────────────┴──────────────┘
        │                                   Event Bus
        ▼                                   /         \
 ActionExecutor                      Notification    Activity
        │                              Service         Service
        ▼                                   │              │
 Workbench Request Bus              Notification     Timeline Experiences
        │                              Experiences          │
        └───────────────┬───────────────────┴──────────────┘
                        ▼
                 Desktop Shell
   (Action surfaces · Knowledge · Notifications · Activity Timeline)
```

| From                   | To                  | Relationship                                        |
| ---------------------- | ------------------- | --------------------------------------------------- |
| Runtime                | All frameworks      | Manifest discovery + capability records             |
| Action Registry        | Knowledge Provider  | Read-only DTO projection                            |
| Workbench Registry     | Knowledge Provider  | Read-only DTO projection                            |
| Action Executor        | Event Bus           | Audit hook publishes on success                     |
| Event Bus              | Notification Mapper | Subscribe → Notification Service                    |
| Event Bus              | Activity Mapper     | Subscribe → Activity Service                        |
| Knowledge Service      | Action Executor     | Selection delegation for commands                   |
| Knowledge Service      | Workbench API       | Selection delegation for navigation                 |
| Workbench              | Action Framework    | `resolveActionExecutor` in shell provider           |
| ENF                    | Workspace           | Notification Experiences consume Presentation hooks |
| ATF                    | Workspace           | Timeline Experiences consume Presentation hooks     |
| PermissionService (M8) | All filter DTOs     | Session adapter — planned                           |

---

## Capability Model

A **Capability** is any registerable platform extension declared by manifest and discovered at runtime.

### Manifest envelope

```yaml
manifestSchemaVersion: "1.0"
id: example-capability
name: Example
version: 1.0.0
kind: module | theme | service | integration | event | ...

workbench:
  navigation: ...
  view: ...
  actions: ...
  toolbar: ...
```

### Discovery roots

```text
packages/**/manifest/
services/**/
integrations/**/
events/**/
```

### Lifecycle

```text
discovered → validated → dependencies-resolved → registered
  → initialised → healthy → active
```

### Capability kinds (Runtime)

Modules, themes, services, integrations, events, components — each with kind-specific schema in Manifest Engine.

**Rule:** Declare before implement. Manifest is the contract.

**Deep dive:** [platform-manifest-specification.md](./platform-manifest-specification.md) · [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md)

---

## Platform Assets

Platform Assets are manifest-declared actions, toolbar regions, and shortcuts that ship with platform capabilities (themes, platform modules).

| Distinction              | `source`   | Versioned by         |
| ------------------------ | ---------- | -------------------- |
| Built-in catalogue       | `builtin`  | Platform release     |
| Platform Asset           | `manifest` | Capability `version` |
| Future capability action | `manifest` | Capability `version` |

Examples (M4):

- `platform.theme.toggle` — theme manifest + workspace toolbar
- `platform.home.navigate` — platform-home manifest + shortcut

Extraction: `mapPlatformCapabilitiesToActionRecords` → `bootstrapActionRegistry` → toolbar/shortcut population.

---

## Registry Pattern

Consolidated pattern for all platform indexes:

| Principle                     | Meaning                                                   |
| ----------------------------- | --------------------------------------------------------- |
| Registration, not execution   | Registries store metadata; executors and surfaces execute |
| Server authority              | Bootstrap server-side; client gets immutable DTO          |
| Normalisation at registration | Manifest strings normalised once at bootstrap             |
| Conflict observability        | Diagnostics report duplicates and orphans                 |
| Read-only client view         | No runtime UI registration                                |

### Registries in Platform 4.0

| Registry               | Package                               | Key               | Consumer                     |
| ---------------------- | ------------------------------------- | ----------------- | ---------------------------- |
| Capability Registry    | platform-runtime                      | capability id     | Runtime, extraction          |
| Workbench Registry     | workbench-framework                   | nav/view ids      | Navigation, View engines     |
| ActionRegistry         | command-framework                     | action id         | Executor, surfaces           |
| ShortcutRegistry       | command-framework                     | normalised chord  | Shell listener               |
| Knowledge Registry     | knowledge-discovery-framework         | source id         | Orchestrator, providers      |
| Event Registry         | event-notification-framework          | event id          | Event Bus, subscribers       |
| Notification Registry  | event-notification-framework          | route id          | Mapper, Notification Service |
| Activity Registry (M7) | activity-timeline-framework (planned) | activity type id  | Activity mapper              |
| Timeline Registry (M7) | activity-timeline-framework (planned) | timeline scope id | Activity Service             |

Knowledge providers **project** Action and Workbench registry DTOs — no new execution pipeline ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

**Deep dive:** [APZHUB-Registry-Pattern.md](./APZHUB-Registry-Pattern.md)

---

## Workbench Surfaces

Presentation-only regions in `@apzhub/workspace` (and structural chrome in `@apzhub/ui`).

### Action Framework surfaces (M4)

| Surface          | Enable flag             | Consumes                       |
| ---------------- | ----------------------- | ------------------------------ |
| Command Palette  | `enableCommandPalette`  | Registry search + execute      |
| Global shortcuts | `enableGlobalShortcuts` | ShortcutRegistry + execute     |
| Context menu     | `enableContextMenu`     | Context-filtered registry      |
| Toolbar          | `enableToolbar`         | Toolbar DTO + registry resolve |

### Notification Experiences (M6)

| Surface            | Enable flag               | Consumes                                            |
| ------------------ | ------------------------- | --------------------------------------------------- |
| Notification Badge | `enableNotificationBadge` | `useNotificationPresentation()`                     |
| Notification Panel | `enableNotificationPanel` | `useNotificationPresentation()` + Service mark read |

### Structural shell (M3)

Activity Bar, Sidebar, Status Bar, Header — registry-driven navigation; not Action Registry consumers (except where actions appear in toolbar).

### Timeline Experiences (M7 — planned)

Context panel Activity tab, timeline feed — consume Activity Service; no Event Bus import.

**Do:** consume read-only registry; call `execute()`; map to UI models  
**Do not:** register actions; evaluate permissions client-side; call engines

**Deep dive:** [APZHUB-Workbench-Surface-Pattern.md](./APZHUB-Workbench-Surface-Pattern.md)

---

## Execution Pipeline

Single path for all user-initiated actions (M4):

```text
Surface / Workbench API
        ↓
DefaultActionExecutor.execute(actionId, { actor, args })
        ↓
Registry lookup → Permission check → Actor routing
        ↓
Handler dispatch
  workbench-bridge → bridge.toAction() → workbenchExecute(actionToRequest())
  service/event    → NOT_IMPLEMENTED
  ai-agent/voice  → Gateway stub → NOT_IMPLEMENTED
        ↓
ActionResult → audit hook → capability.action.executed (M6)
        ↓
Notification Mapper → Notification Service (parallel: Activity Mapper M7)
```

Shared executor in `apps/web`: one instance for Workbench API and `CommandRegistryProvider`.

**Constraint for M5+:** Knowledge & Discovery routes selections to **existing** `execute()` — no parallel pipeline.

**Constraint for M6+:** Notifications and Activity records are created only by Event Bus subscribers — not by modules or Experiences directly.

---

## API Layering

Document 000 §6.1 — three public API layers:

| Layer          | API                                         | Consumers             | Must not                              |
| -------------- | ------------------------------------------- | --------------------- | ------------------------------------- |
| **Runtime**    | `Runtime.bootstrap()`, `Runtime.registry()` | Server bootstrap, ops | Import React                          |
| **Workbench**  | `WorkbenchAPI`, Workbench Requests          | Capabilities, shell   | Import engines                        |
| **Capability** | Manifests, Platform Services, SDKs          | Business features     | Bypass Workbench for UI orchestration |

Action Framework sits in **Platform Capabilities** layer:

- Surfaces → `useCommandRegistry().execute()`
- Workbench API → `executeAction()` via injected executor
- Both converge on `DefaultActionExecutor`

---

## Diagnostics

| Layer                 | Mechanism                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Runtime               | `Runtime.getDiagnostics()`, health providers                                                             |
| Workbench             | Per-engine diagnostics via API                                                                           |
| Action Framework      | Registry diagnostics, hydration diagnostics                                                              |
| Knowledge & Discovery | Registry diagnostics, hydration diagnostics, query lifecycle                                             |
| Event & Notification  | Registry diagnostics, mapper/service diagnostics, hydration                                              |
| Health endpoint       | `/api/health` — DB, Redis, runtime, `commands`, `knowledge`, `events`, `notifications`                   |
| Dev UI                | `ActionFrameworkDiagnostics`, `KnowledgeDiscoveryDiagnostics`, `EventNotificationDiagnostics` (dev only) |

Production operators: health endpoint. Not dev-only hidden spans.

---

## Package boundaries

| Package                         | May import                                                                                                                      | Must not import                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `platform-runtime`              | config, shared, types                                                                                                           | ui, workspace, workbench-framework, command-framework, react |
| `workbench-framework`           | platform-runtime (server types), types                                                                                          | business capabilities                                        |
| `command-framework`             | workbench-framework (bridge types), types                                                                                       | apps/web                                                     |
| `knowledge-discovery-framework` | command-framework, workbench-framework (DTO types), types                                                                       | apps/web (direct import discouraged)                         |
| `event-notification-framework`  | types; integration with command-framework audit types                                                                           | workbench engines, apps/web internals                        |
| `workspace`                     | ui, command-framework/react, workbench-framework/react, knowledge-discovery-framework/react, event-notification-framework/react | platform-runtime/server (client)                             |
| `apps/web`                      | all platform packages                                                                                                           | — (composition root)                                         |

### Composition root

`apps/web` is the **only** application integration layer:

- `runtime-init.ts` — Runtime bootstrap
- `workbench-hydration.ts` — Workbench DTO
- `command-hydration.ts` — Action Registry DTO
- `knowledge-hydration.ts` — Knowledge Source Registry DTO
- `event-notification-hydration.ts` — Event + Notification DTOs + shared context
- `action-workbench-shell-provider.tsx` — Provider stack (Action + Knowledge + Notification)

---

## Dependency rules

1. **Downward only** — no lower layer imports higher layer
2. **Manifest first** — extensions begin with YAML
3. **Server authority** — permission-filter before client hydration
4. **No engine bypass** — capabilities use Workbench API
5. **No duplicate execution paths** — one executor, one Request Bus
6. **ADR for baseline changes** — frozen v1.0 preserved
7. **Tests mandatory** — no feature without automated tests
8. **Documentation is code** — undocumented features incomplete

---

## Monorepo layout

```text
apps/web/                 Application (composition root)
packages/
  platform-runtime/       M2
  workbench-framework/    M3
  command-framework/      M4
  knowledge-discovery-framework/  M5
  event-notification-framework/   M6
  workspace/              Shell + surfaces
  ui/                     Design system
  auth/ config/ theme/    Foundation
services/ integrations/ events/   Future capability roots
docs/                     Foundation + architecture + governance
testing/                  Playwright, fixtures
```

---

## Related documents

| Document                                                                         | Topic                                                |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [APZHUB-Platform-v4.0.md](../releases/APZHUB-Platform-v4.0.md)                   | Official Platform 4.0 release — **current baseline** |
| [APZHUB-Platform-v3.0.md](../releases/APZHUB-Platform-v3.0.md)                   | Platform 3.0 release (M1–M5)                         |
| [APZHUB-Platform-Reference-Patterns.md](./APZHUB-Platform-Reference-Patterns.md) | Authoritative platform patterns (v4.0)               |
| [APZHUB-Platform-Design-Patterns.md](./APZHUB-Platform-Design-Patterns.md)       | Historical v3.0 patterns                             |
| [event-notification-framework.md](./event-notification-framework.md)             | M6 subsystem architecture                            |
| [APZHUB-Platform-Governance.md](../governance/APZHUB-Platform-Governance.md)     | Process and standards                                |
| [APZHUB-Platform-Roadmap-v2.md](../roadmap/APZHUB-Platform-Roadmap-v2.md)        | Milestones 5–10                                      |
| [Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md)             | Frozen baseline                                      |

---

_APZHUB Platform Reference Architecture — Version 4.0 consolidation._
