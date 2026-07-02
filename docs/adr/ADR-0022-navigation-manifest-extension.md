# ADR-0022 — Navigation Manifest Extension

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-003 Phase 0  
> **Decided by:** Project owner (Sprint 003 Phase 0 approval)  
> **Related:** [ADR-0011](./ADR-0011-unified-manifest-envelope.md) · [Document 017](../017-navigation-framework-workspace-navigation-architecture.md) · [Document 028](../028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)

## Problem

The unified manifest envelope ([ADR-0011](./ADR-0011-unified-manifest-envelope.md)) defines shared fields and kind-specific payloads (`component:`, `module:`, etc.). Workbench navigation and view registration require metadata not present in existing schemas. This metadata must be added **without breaking** existing manifests or requiring migration of manifests that do not participate in workbench navigation.

## Decision

Add an **optional top-level `workbench` block** to the manifest envelope. Validation is additive: manifests without `workbench` continue to validate unchanged.

### Envelope extension

```yaml
# Optional — omitted on manifests that do not participate in workbench UI
workbench:
  navigation: { ... } # optional
  view: { ... } # optional
  context: { ... } # optional — Phase 6+
```

The `workbench` block may appear on any capability kind that registers workbench surfaces. Primary consumers: `module`, `component` (shell scaffold), `service` (administration scaffold).

### Navigation block schema

Maps to Document 017 four-level hierarchy:

```yaml
workbench:
  navigation:
    id: home # optional; defaults to capability id
    level: activity-bar # activity-bar | sidebar | workspace | context
    workspace: home # workspace scope (activity-bar level)
    label: Home # display override; defaults to capability name
    icon: home # icon key (design system)
    route: /workspace/home # deep link path
    order: 10 # sort order within level
    parent: null # parent nav id for tree hierarchy
    permission: platform.nav.home.view # required permission key (optional in dev)
    hidden: false # hide until revealNavigationItem
    badge: null # optional badge key (future attention engine)
```

| Field        | Required                                  | Description                   |
| ------------ | ----------------------------------------- | ----------------------------- |
| `level`      | Yes (if navigation present)               | Document 017 navigation level |
| `workspace`  | When `level` is sidebar/workspace/context | Active workspace scope        |
| `route`      | Recommended                               | Deep link target              |
| `permission` | Optional                                  | Filter key; see ADR-0023      |
| `order`      | Optional                                  | Default `100`                 |
| `parent`     | Optional                                  | Tree parent nav id            |
| `hidden`     | Optional                                  | Default `false`               |

### View block schema

```yaml
workbench:
  view:
    viewId: platform-settings # optional; defaults to {capabilityId}-view
    title: Platform Settings # tab title
    workspace: administration # workspace scope
    route: /workspace/administration/settings
    permission: platform.admin.settings.view
    default: false # open on workspace enter
    icon: settings
```

| Field        | Required              | Description                   |
| ------------ | --------------------- | ----------------------------- |
| `title`      | Yes (if view present) | Tab display title             |
| `workspace`  | Yes (if view present) | Workspace that owns this view |
| `route`      | Recommended           | Deep link for openView        |
| `permission` | Optional              | Required to open view         |

### Validation rules

1. **`workbench` is optional** — existing manifests validate without change.
2. **`workbench` uses `.strict()` Zod object** — unknown keys fail validation when block is present.
3. **Navigation and view are independent** — a capability may declare navigation only, view only, or both.
4. **Id uniqueness** — Navigation `id` and view `viewId` must be unique within registry; enforced at registry index time (Phase 2), not Zod alone.
5. **Kind compatibility** — Manifest Engine accepts `workbench` on all kinds; registry filters to `active` capabilities only.

### Manifest Engine changes (Phase 2 — not Phase 0)

| Change                                 | Location                                                             |
| -------------------------------------- | -------------------------------------------------------------------- |
| `workbenchSchema` Zod definition       | `packages/platform-runtime/src/manifest-engine/schemas/workbench.ts` |
| Optional `workbench` on envelope union | Per-kind schemas or shared extension in `schemas/extensions.ts`      |
| Registry helper                        | `PlatformRegistry.getWorkbenchNavItems()`, `getWorkbenchViews()`     |

### Example — module with navigation and view

```yaml
manifestSchemaVersion: "1.0"
id: administration
name: Administration
version: 0.1.0
kind: module

metadata:
  category: platform
  description: Administration workspace scaffold.

dependencies:
  platform: []

module:
  entry: packages/administration/src/index.ts

workbench:
  navigation:
    level: activity-bar
    workspace: administration
    icon: shield
    route: /workspace/administration
    order: 20
    permission: platform.nav.administration.view
  view:
    title: Administration Home
    workspace: administration
    route: /workspace/administration
    permission: platform.nav.administration.view
```

### Example — existing component unchanged

```yaml
# packages/ui/src/components/button/component.yaml — no workbench block required
manifestSchemaVersion: "1.0"
id: button
kind: component
# ... unchanged ...
```

### Scaffold manifest updates (Phase 2)

Minimum Sprint 003 demo manifests receive `workbench.navigation` blocks:

- Activity Bar component manifest (TD-017) — scaffold entry if applicable
- Administration workspace scaffold
- Home workspace fallback

## Alternatives

| Alternative                                      | Why rejected                                              |
| ------------------------------------------------ | --------------------------------------------------------- |
| Separate `nav.yaml` per capability               | Complicates discovery; splits source of truth             |
| Put navigation in `metadata`                     | Pollutes generic metadata; no structured validation       |
| Required `workbench` on all manifests            | Breaks existing manifests; violates additive rule         |
| Root-level `navigation:` sibling to `component:` | Inconsistent across kinds; `workbench` groups UI concerns |

## Consequences

- Phase 2 adds Zod schema and Manifest Engine validation — runtime change, not Phase 0
- Existing manifests require **no migration** unless they register workbench surfaces
- Navigation Manager hydrates from registry DTO derived from `workbench.navigation`
- View Manager hydrates from `workbench.view`
- Document 017 remains authoritative for UX semantics; this ADR defines manifest encoding only
