# APZHUB Capability Development Guide

> **Audience:** Developers building platform or business capabilities  
> **Authority:** [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [025 — Module SDK](../025-module-sdk-module-manifest-module-development-standard.md)  
> **Example:** Fictional **Example Capability** — not a real business module

---

## Overview

A **Capability** is any registerable platform extension declared by manifest and discovered at runtime. This guide teaches the full development workflow using a fictional example.

**Example Capability** (`example-capability`) — a scaffold module that demonstrates navigation, views, actions, and permissions without business logic.

---

## Directory structure

```text
packages/example-capability/
├── package.json
├── src/
│   ├── index.ts                 # Public exports (minimal)
│   ├── manifest/
│   │   └── module.yaml          # Authoritative manifest
│   ├── services/
│   │   └── example-service.ts   # Platform Service (future wiring)
│   └── views/
│       └── example-overview.tsx # React view (uses Workbench API only)
└── src/
    └── example-capability.test.ts
```

> **Note:** Example Capability is documentation-only in Baseline v1.0. Do not implement until Milestone 9 planning approves business capabilities.

Manifest discovery path (when implemented):

```text
packages/example-capability/src/manifest/module.yaml
```

---

## Manifest

```yaml
# packages/example-capability/src/manifest/module.yaml
# Fictional example — not deployed in Baseline v1.0

apiVersion: apzhub.io/v1
kind: module
id: example-capability
name: Example Capability
version: 1.0.0
manifestSchemaVersion: "1.0"

metadata:
  category: example
  description: Fictional capability for developer documentation
  owner: platform-team

compatibility:
  platformVersion: ">=0.3.0"

dependencies:
  platform:
    - workbench-framework

lifecycle:
  status: enabled

permissions:
  - key: example.view
    description: View example overview
  - key: example.action.demo
    description: Run example demo action

workbench:
  navigation:
    workspaces:
      - id: example
        label: Example
        icon: beaker
        route: /workspace/example
        permission: example.view
        items:
          - id: example-overview
            label: Overview
            route: /workspace/example/overview
            viewId: example-overview
            permission: example.view

  views:
    - id: example-overview
      label: Example Overview
      route: /workspace/example/overview
      permission: example.view
      component: ExampleOverviewView

  actions:
    - id: example.action.demo
      label: Run Demo
      permission: example.action.demo
      handler: workbench-bridge:workbench.navigation.reveal
      palette: true
      shortcut: Ctrl+Shift+D
      group: Example
      icon: play
      order: 10
  toolbar:
    - region: workspace
      items:
        - commandId: example.action.demo
          icon: play
          label: Run Demo
          order: 10
```

### Manifest rules

1. **Declare before implement** — manifest is the contract.
2. **Permission keys** — every navigable item and action declares a key.
3. **Workbench blocks** — navigation and views; never hardcode in React.
4. **Dependencies** — list platform packages and services explicitly.
5. **Version** — semver; compatible `platformVersion` range required.

---

## Navigation

Navigation is **registry-driven**. Example Capability declares:

| Element       | Purpose                                |
| ------------- | -------------------------------------- |
| Workspace     | Activity Bar entry (`example`)         |
| Sidebar items | Nested navigation under workspace      |
| Routes        | App Router paths synced by View Engine |
| `viewId`      | Links sidebar item to view descriptor  |

The Navigation Engine hydrates from filtered registry DTO. Capabilities do not render the Activity Bar — they declare data only.

**Permission:** `example.view` required to see workspace and items.

---

## Views

Views declare:

- `id` — stable identifier
- `route` — URL path
- `permission` — visibility gate
- `component` — React component name (future mount pipeline)

Views are activated via Workbench API:

```typescript
// Inside a capability view — illustrative only
import { useWorkbenchAPI } from "@apzhub/workbench-framework";

function ExampleOverviewView() {
  const workbench = useWorkbenchAPI();
  // Read state; publish requests — never import engines
  return <div>Example Overview</div>;
}
```

View content mount pipeline is deferred to Milestone 9+. Baseline v1.0 activates routes and focused view state.

---

## Actions

Actions declare executable behaviour via `workbench.actions` (canonical; legacy alias `workbench.commands` per ADR-0025).

| Field                  | Purpose                                |
| ---------------------- | -------------------------------------- |
| `id`                   | Stable action identifier               |
| `label`                | Display name (palette, toolbar)        |
| `handler`              | `workbench-bridge:…` or `service:…`    |
| `permission`           | Visibility and execution gate          |
| `shortcut`             | Global chord (optional)                |
| `palette`              | Include in Command Palette when `true` |
| `group` / `order`      | Palette grouping and sort              |
| `icon` / `description` | Presentation metadata                  |

Execution path (SPR-004):

```text
Shell surface → useCommandRegistry().execute(actionId)
            → DefaultActionExecutor
            → WorkbenchCommandBridge (workbench-bridge handlers)
            → Workbench Request Bus
```

**Rule:** Actions invoke Platform Services or publish Workbench Requests — never manipulate DOM directly.

See [Action Framework onboarding](../developer/action-framework-onboarding.md).

---

## Knowledge Sources (SPR-005)

Capabilities may declare optional **Knowledge Sources** for the Knowledge & Discovery Framework:

```yaml
knowledge:
  sources:
    - id: my-capability.docs
      label: Documentation
      kind: registry-projection
      tier: T2
      provides: [content]
      status: active
      origin: manifest
```

| Field           | Purpose                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `id`            | Stable source identifier                                                         |
| `kind` / `tier` | Taxonomy per [knowledge-sources spec](../specs/SPR-005-KDF-knowledge-sources.md) |
| `provides`      | Document kinds this source supplies                                              |
| `status`        | `active` \| `inactive`                                                           |

Registration path:

```text
Manifest knowledge.sources
        ↓
bootstrapKnowledgeRegistry({ capabilityRecords })
        ↓
Knowledge Provider (you implement) projects content → KnowledgeDocument[]
```

**Rule:** Knowledge Providers **reference** actions and navigation — they do not replace Action or Workbench manifest blocks. Selection from Knowledge Experiences routes through existing `execute()` and Workbench navigation ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)).

See [Knowledge & Discovery onboarding](../developer/knowledge-discovery-onboarding.md).

---

## Events and Notifications (SPR-006)

Capabilities may declare optional **events** and **notification routes** for the Event & Notification Framework:

```yaml
events:
  - id: capability.example.record.created
    category: capability
    version: "1.0.0"
    publisher: example-capability
    description: Emitted when a record is created.

notifications:
  routes:
    - routeId: capability.example.record.created.inbox
      eventPattern: capability.example.record.created
      notificationKind: inbox
      channel: in-app
      titleTemplate: "Record {{payload.recordId}} created"
      bodyTemplate: "Created by {{payload.actor}}"
```

| Block                  | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `events`               | Register domain events for Event Registry bootstrap   |
| `notifications.routes` | Map event patterns to notification kinds and channels |

Execution path for action-driven notifications (no capability code required):

```text
workbench.actions → DefaultActionExecutor → audit hook
→ capability.action.executed → Notification Mapping → shell badge/panel
```

**Rules:**

- Capabilities **publish events** after successful operations — they do not write to Notification Service directly
- Notification routes reference `eventPattern` — not action ids directly (unless encoded in payload templates)
- Use `channel: in-app` for SPR-006 shell delivery; external channels are stubs until Delivery Service (M8+)
- Selection from notification items with `actionRef` routes through existing `execute()` — same as Knowledge selection

See [Event & Notification onboarding](../developer/event-notification-onboarding.md).

---

## Activity & Timeline manifest blocks (SPR-007)

Capabilities may declare activity types and timeline definitions alongside events and notifications:

```yaml
activities:
  types:
    - id: capability.example.record.created
      version: "1.0.0"
      eventPattern: capability.example.record.created
      category: capability
      timelineScopes:
        - timeline.personal
      templateRef: activity.capability.example.record.created
      label: Record created
      status: active
  timelines:
    - id: timeline.personal
      scope: personal
      label: Personal activity
      grouping: date
      version: "1.0.0"
      status: active
```

| Block                  | Purpose                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `activities.types`     | Register activity types for Activity Registry bootstrap (**not** `activity.types`) |
| `activities.timelines` | Register timeline scope descriptors for Timeline Registry bootstrap                |

Execution path for action-driven activity (no capability code required):

```text
workbench.actions → DefaultActionExecutor → audit hook
→ capability.action.executed → Activity Mapping → Context Panel timeline
```

**Rules:**

- Capabilities **publish events** — they do not write to Activity Service directly
- Activity types reference `eventPattern` — parallel to notification routes on the same event
- Activity ≠ Notification — separate mappers, services, and Experiences
- Default timeline scope: `timeline.personal`

See [Activity Timeline onboarding](../developer/activity-timeline-onboarding.md).

---

## Permissions

| Key                   | Scope                                 |
| --------------------- | ------------------------------------- |
| `example.view`        | See workspace, sidebar, overview view |
| `example.action.demo` | Execute demo action                   |

Permissions are checked by:

1. **Server:** `filterWorkbenchRegistryDto()` — strips disallowed navigation/views
2. **Workbench Manager:** permission gate on each request
3. **Session restore:** sanitisation drops disallowed persisted state

Full RBAC population from auth session — Milestone 8. Declare keys now; enforcement structure is in place.

---

## Tests

Minimum for a real capability:

```text
example-capability.test.ts
  ✓ manifest validates against Manifest Engine schema
  ✓ permission keys declared for all navigation items
  ✓ workbench.navigation routes are unique
  ✓ workbench.views reference valid viewIds

integration (when service exists)
  ✓ service health check returns ok

e2e (when UI mounted)
  ✓ Activity Bar shows Example workspace when permitted
  ✓ sidebar navigates to overview route
```

Run: `pnpm test`, `pnpm test:e2e`.

---

## Documentation

Every capability requires:

| Artifact               | Example                                 |
| ---------------------- | --------------------------------------- |
| Manifest comment block | Purpose, owner, permissions             |
| README in package      | Setup, local dev, test commands         |
| Architecture note      | If introducing new patterns — ADR first |
| CHANGELOG entry        | When shipped                            |

---

## Examples — request patterns

### Navigate to a view

```typescript
await workbench.openView({ viewId: "example-overview" });
```

### Set context for context panel

```typescript
await workbench.setContext({
  type: "example.item",
  payload: { itemId: "demo-1" },
});
```

### Reveal navigation item

```typescript
await workbench.revealNavigation({ navId: "example-overview" });
```

All calls go through **Workbench API** — never Request Bus or engines from capability code.

---

## Future execution gateways (AF-018)

Non-user invocation sources (AI agent, voice, automation) route through `@apzhub/command-framework` gateways before reaching `ActionExecutor`. Sprint 004 exports **stub gateways only** — they return `NOT_IMPLEMENTED`.

Capabilities must not:

- Import gateway stubs for production behaviour
- Bypass `ActionExecutor` for manifest-declared actions
- Assume AI or voice execution is available

When future milestones enable gateways, capabilities continue to declare actions in manifest YAML — execution origin is attributed by the gateway layer, not capability code.

See [SPR-004-AF-invocation-sources.md](../specs/SPR-004-AF-invocation-sources.md) and [Gateway Architecture](../../packages/command-framework/src/gateways/GATEWAY-ARCHITECTURE.md).

---

## Checklist

Before submitting a capability:

- [ ] Manifest validates
- [ ] All navigation permission-keyed
- [ ] No hardcoded routes in shell code
- [ ] No engine imports from capability
- [ ] No direct backend API calls from React
- [ ] Unit tests pass
- [ ] Documentation updated
- [ ] ADR filed if new kind or baseline exception

---

_APZHUB Capability Development Guide — fictional Example Capability for teaching._
