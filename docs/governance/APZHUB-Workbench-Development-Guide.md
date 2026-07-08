# APZHUB Workbench Development Guide

> **Audience:** Engineers extending the Workbench Framework  
> **Authority:** [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [workbench-manager.md](../architecture/workbench-manager.md)  
> **Package:** `@apzhub/workbench-framework`

---

## Overview

The Workbench Framework owns **all user interaction orchestration**. Extend it safely by respecting engine boundaries, the Request Bus, and the Workbench API.

**Do not** add business logic to engines. **Do not** expose engines to capabilities.

---

## Architecture recap

```text
Workbench API  →  Request Bus  →  Workbench Manager  →  Engines
                                                              ↓
                                                    Presentation Adapters
                                                              ↓
                                                    @apzhub/ui / Desktop Shell
```

---

## Presentation Adapters

Presentation adapters translate engine state into render props for `@apzhub/ui` components. They **do not** mutate state.

| Adapter                             | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `activity-bar-presentation-adapter` | Activity Bar items from Navigation Engine |
| `sidebar-presentation-adapter`      | Sidebar items for active workspace        |
| `navigation-presentation-adapter`   | Shared navigation model types             |

**Rules:**

- Adapters are pure functions or thin mappers
- No side effects, no API calls, no permission logic (already filtered)
- Shell components consume adapter output only

When adding a new shell region, create an adapter — do not embed engine logic in React.

---

## Workbench Requests

All UI state changes arrive as typed **Workbench Requests** on the Request Bus.

| Request family | Engine            |
| -------------- | ----------------- |
| `layout.*`     | Layout Engine     |
| `panel.*`      | Panel Engine      |
| `navigation.*` | Navigation Engine |
| `view.*`       | View Engine       |
| `session.*`    | Session Engine    |
| `context.*`    | Context Engine    |
| `selection.*`  | Selection Engine  |

### Adding a new request type

1. ADR required — public request contract change
2. Add type to request union
3. Route in Workbench Manager `handleRequest`
4. Implement in target engine only
5. Expose via Workbench API helper (not raw bus from capabilities)
6. Unit tests for manager routing and engine behaviour
7. Update architecture docs

Capabilities publish via Workbench API — not `bus.publish()` directly in production code.

---

## Workbench Actions and Action Framework (SPR-004)

Baseline v1.0 includes:

- `WorkbenchAction` discriminated union
- `REQUEST_COMMAND_MAP` — maps requests to action IDs
- `executeAction()` on Workbench API
- `WorkbenchCommandBridge` — implemented in `@apzhub/command-framework`

Sprint 004 connects actions to the **Action Framework**. User-facing surfaces (palette, shortcuts, toolbar, context menu) execute through `DefaultActionExecutor` → bridge → Request Bus.

When extending:

- Prefer manifest `workbench.actions` for capability actions (ADR-0025)
- Built-in bridge actions live in `PLATFORM_ACTION_CATALOGUE`
- Bridge executes via Action Registry — not direct engine calls

See [command-framework.md](../architecture/command-framework.md).

---

## Knowledge Experiences (SPR-005)

The Workbench hosts **Knowledge Experiences** — discovery surfaces that consume the Knowledge Service:

```text
Knowledge Sources → Knowledge Registry → Knowledge Query API
→ Knowledge Presentation Layer → Knowledge Experiences
```

| Surface                        | Package             | Consumes                                                        |
| ------------------------------ | ------------------- | --------------------------------------------------------------- |
| Knowledge Overlay              | `@apzhub/workspace` | `useKnowledgeService()` + Presentation Layer                    |
| Command Palette knowledge mode | `@apzhub/workspace` | `useKnowledgeService()` via `useCommandPaletteKnowledgeQuery()` |

Presentation helpers (`groupKnowledgeDocuments`, `delegateKnowledgeOverlaySelection`) live in `@apzhub/workspace` — the **Knowledge Presentation Layer**. They are not UI surfaces.

When extending:

- Experiences call **`useKnowledgeService()`** — not the orchestrator or `KnowledgeQueryClient`
- Selection delegates through `createWorkbenchKnowledgeSelectionHandlers()` → Action `execute()` or `activateViewForRoute()`
- Command Palette **commands mode** (default) remains on Action Registry — separate path

Requires `KnowledgeDiscoveryProvider` ancestor (wired in `ActionWorkbenchShellProvider`).

See [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md) · [Knowledge & Discovery onboarding](../developer/knowledge-discovery-onboarding.md).

---

## Notification Experiences (SPR-006)

The Workbench hosts **Notification Experiences** — shell surfaces that consume the Notification Presentation Layer:

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

| Surface            | Package             | Consumes                                                |
| ------------------ | ------------------- | ------------------------------------------------------- |
| Notification Badge | `@apzhub/workspace` | `useNotificationPresentation()`                         |
| Notification Panel | `@apzhub/workspace` | `useNotificationPresentation()` + mark-read via service |

Presentation helpers (`mapNotificationItemToViewModel`, `groupNotificationsByPriority`, `formatNotificationRelativeTimestamp`) live in `@apzhub/event-notification-framework` — the **Notification Presentation Layer**. They are not UI surfaces.

When extending:

- Experiences call **`useNotificationPresentation()`** — not Event Bus or mapper internals
- Mark read delegates through `useNotificationService()` — not direct store mutation
- Action audit publishes `capability.action.executed` — primary M6 notification source

Requires `NotificationRegistryProvider` + `NotificationServiceProvider` ancestors (wired in `ActionWorkbenchShellProvider`).

See [event-notification-framework.md](../architecture/event-notification-framework.md) · [Event & Notification onboarding](../developer/event-notification-onboarding.md).

---

## Timeline Experiences (SPR-007)

The Workbench hosts **Timeline Experiences** — shell surfaces that consume the Activity Presentation Layer:

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences → Context Panel
```

| Surface                    | Package             | Consumes                                         |
| -------------------------- | ------------------- | ------------------------------------------------ |
| Context Panel Activity tab | `@apzhub/workspace` | `useActivityTimelineExperienceDiagnostics()`     |
| Inline activity feed       | `@apzhub/workspace` | `WorkbenchActivityTimeline` (`variant="inline"`) |

Presentation helpers (`mapActivityDocumentToViewModel`, `presentActivities`, date grouping) live in `@apzhub/activity-timeline-framework` — the **Activity Presentation Layer**. They are not UI surfaces.

When extending:

- Experiences call **`useActivityTimelineExperienceDiagnostics()`** — not Event Bus, mapper, or `DefaultActivityService`
- Action delegation from activity items with `actionRef` routes through `useCommandRegistry().execute()` — same as Knowledge selection
- Action audit publishes `capability.action.executed` — primary M7 activity source (parallel to notifications)

Requires `ActivityTimelineProvider` + `ActivityTimelineServiceProvider` ancestors (wired in `ActionWorkbenchShellProvider` after Notification providers).

DesktopShell flags: `enableActivityTimeline`, `enableActivityTimelinePanel`.

See [activity-timeline-framework.md](../architecture/activity-timeline-framework.md) · [Activity Timeline onboarding](../developer/activity-timeline-onboarding.md).

---

## Engines

| Engine     | Owns                         | Does not own             |
| ---------- | ---------------------------- | ------------------------ |
| Layout     | Region geometry, dock splits | View content, navigation |
| Panel      | Visibility, collapse, resize | Context data, nav scope  |
| Navigation | Workspaces, sidebar model    | View lifecycle           |
| View       | Active view, routes          | Tab UI (deferred)        |
| Session    | Persist/restore snapshots    | Permission policy        |
| Context    | Context panel state          | Panel visibility         |
| Selection  | Per-view selection           | Global clipboard         |

**Engines may not call each other directly.** Coordinate through Workbench Manager only.

### Extending an engine

1. Read [workbench-manager.md](../architecture/workbench-manager.md)
2. Implement handler in engine class
3. Register route in Workbench Manager
4. Add session capture slice if state must persist
5. Add permission check in manager gate if user-initiated
6. Tests + diagnostics update

---

## State

Aggregated in `WorkbenchState`:

```text
WorkbenchState
├── layout
├── panels
├── navigation
├── view
├── session
├── context
└── selection
```

Subscribers (React context) receive immutable snapshots. Manager publishes on change.

**Rule:** Engines mutate their slice; Manager merges and notifies.

---

## Session

Session Engine (ADR-0021):

- **Store:** `localStorage` key `apzhub:workbench:session:{userId}`
- **Schema:** versioned JSON (`1.0`)
- **Capture:** on state change (debounced)
- **Restore:** on bootstrap; permission sanitisation strips invalid IDs

When adding persistable state:

1. Extend session schema with version bump if breaking
2. Add capture in `session-capture.ts`
3. Add restore in `session-restore.ts`
4. Sanitise in restore against permission adapter
5. E2E test reload persistence

PostgreSQL session sync — Milestone 8.

---

## Navigation

Navigation Engine hydrates from server-filtered registry DTO:

```text
Runtime.registry()
        ↓
filterWorkbenchRegistryDto(dto, permissionAdapter)   [server]
        ↓
createWorkbenchManager({ registry: filteredDto })     [client]
        ↓
Navigation Engine.buildModel()
```

Manifest block: `workbench.navigation` (ADR-0022).

**Never** hardcode workspaces or sidebar items in `apps/web`.

---

## Views

View Engine maps manifest `workbench.view` to routes:

- `openView`, `closeView`, `focusView` requests
- Route sync with Next.js App Router
- Session restores focused view

View **content** mount pipeline deferred — placeholder region in Baseline v1.0.

When implementing mount pipeline (future):

- View registration table from registry
- Lazy-loaded capability components
- Permission gate per view
- ADR required

---

## Permission integration

| Component                            | Role                               |
| ------------------------------------ | ---------------------------------- |
| `ScaffoldWorkbenchPermissionAdapter` | Dev allow-all                      |
| `AuthWorkbenchPermissionAdapter`     | Production structure; RBAC keys M8 |
| `createWorkbenchPermissionAdapter()` | DI factory                         |
| `filterWorkbenchRegistryDto()`       | Server-side registry filter        |

Workbench Manager calls `permissionAdapter.can()` before dispatching user-initiated requests.

Session restore calls adapter to drop disallowed workspace/view IDs.

**Do not** hardcode permission checks in engines — use adapter interface.

---

## App integration points

| File                                                           | Purpose                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/web/lib/workbench-hydration.ts`                          | Server workbench registry filter + DTO                          |
| `apps/web/lib/command-hydration.ts`                            | Server action registry bootstrap + filter + diagnostics         |
| `apps/web/lib/knowledge-hydration.ts`                          | Server knowledge registry bootstrap + health summary            |
| `apps/web/lib/event-notification-hydration.ts`                 | Server event/notification registry bootstrap + health           |
| `apps/web/lib/activity-timeline-hydration.ts`                  | Server activity/timeline registry bootstrap + health            |
| `apps/web/lib/create-app-activity-timeline-context.ts`         | Shared ActivityTimelineContext composition root                 |
| `apps/web/lib/wire-app-activity-timeline.ts`                   | Event Bus subscriber wiring for Activity Mapping                |
| `apps/web/lib/use-app-event-notification-context.ts`           | Client shared EventNotificationContext hook                     |
| `apps/web/lib/use-app-knowledge-service.ts`                    | Client Knowledge Service factory from hydrated DTOs             |
| `apps/web/app/(platform)/action-workbench-shell-provider.tsx`  | Client Workbench + Command + Knowledge + Notification providers |
| `apps/web/lib/create-app-action-executor.ts`                   | Shared `DefaultActionExecutor` bundle for app wiring            |
| `packages/workbench-framework/src/react/workbench-context.tsx` | React context + hooks; optional `resolveActionExecutor`         |

Changes to app wiring require E2E verification of navigation, session restore, Action Framework surfaces (`spr-004-action-framework.spec.ts`), Knowledge Service integration (`spr-005-knowledge-discovery-framework.spec.ts`), Event & Notification integration (`spr-006-event-notification-framework.spec.ts`), and Activity & Timeline integration (`spr-007-activity-timeline-framework.spec.ts`).

---

## Safe extension checklist

- [ ] ADR filed for API/request contract changes
- [ ] Engine boundary respected — no cross-engine calls
- [ ] Workbench API surface updated (not raw engine export)
- [ ] Session capture/restore if state persists
- [ ] Permission gate in manager
- [ ] Presentation adapter for new UI regions
- [ ] Unit + E2E tests
- [ ] Architecture doc updated

---

_APZHUB Workbench Development Guide — safe extension of the Workbench Framework._
