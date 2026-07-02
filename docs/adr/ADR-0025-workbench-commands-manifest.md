# ADR-0025 — Workbench Commands Manifest Extension

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-004 — AF-001  
> **Decided by:** Project owner (Sprint 004 authorisation)  
> **Related:** [ADR-0022](./ADR-0022-navigation-manifest-extension.md) · [ADR-0024](./ADR-0024-command-framework-package.md) · [Document 019](../019-universal-command-palette-action-framework.md)

## Problem

Baseline v1.0 defines optional `workbench.navigation` and `workbench.view` blocks ([ADR-0022](./ADR-0022-navigation-manifest-extension.md)). Sprint 004 requires capabilities to declare **executable commands** for Command Palette, keyboard shortcuts, context menus, and toolbar bindings.

Commands must be:

- Declared in manifest (manifest-first)
- Validated additively (existing manifests unchanged)
- Permission-filtered server-side (ADR-0023 pattern)
- Discoverable by CommandRegistry at hydration

## Decision

Extend the optional top-level `workbench` block with **`commands`** and **`toolbar`** arrays. Validation is additive — manifests without these keys continue to validate unchanged.

### Envelope extension

```yaml
workbench:
  navigation: { ... } # existing — ADR-0022
  view: { ... } # existing — ADR-0022
  commands: [...] # new — Sprint 004
  toolbar: [...] # new — Sprint 004 (optional)
```

### Commands array schema

```yaml
workbench:
  commands:
    - id: platform.theme.toggle
      label: Toggle Theme
      handler: theme-service:toggle
      permission: platform.theme.manage
      shortcut: Ctrl+Shift+T
      palette: true
      icon: sun
      group: appearance
      contextWhen: # optional — context menu scoping
        surfaces: [workspace]
        selectionKinds: [none]
      order: 10
```

| Field         | Required | Description                                         |
| ------------- | -------- | --------------------------------------------------- |
| `id`          | Yes      | Globally unique command id; dot notation            |
| `label`       | Yes      | Display label for palette, menus, toolbar tooltip   |
| `handler`     | Yes      | Handler reference (see Handler kinds below)         |
| `permission`  | Optional | Permission key; filtered when present (ADR-0023)    |
| `shortcut`    | Optional | Key chord string; registered in ShortcutRegistry    |
| `palette`     | Optional | Default `true` — include in Command Palette listing |
| `icon`        | Optional | Design system icon key                              |
| `group`       | Optional | Palette grouping / category label                   |
| `contextWhen` | Optional | Context menu visibility predicate                   |
| `order`       | Optional | Sort order within group; default `100`              |

### Handler kinds

Handler string format: `{kind}:{target}`

| Kind               | Format                         | Example                                | Execution path                                   |
| ------------------ | ------------------------------ | -------------------------------------- | ------------------------------------------------ |
| `workbench-bridge` | `workbench-bridge:{commandId}` | `workbench-bridge:workbench.view.open` | Bridge → WorkbenchAction → Request Bus           |
| `service`          | `service:{serviceId}:{method}` | `service:theme-service:toggle`         | Platform Service call (stub until service wired) |
| `event`            | `event:{eventId}`              | `event:platform.theme.changed`         | Event Bus publish (future)                       |

Built-in workbench commands use handler kind implied by id prefix `workbench.*` — registered programmatically in AF-009, not required in every manifest.

Sprint 004 **implements** `workbench-bridge` handlers fully. `service` handlers return structured `NOT_IMPLEMENTED` until Platform Service wiring exists. `event` handlers deferred.

### Toolbar array schema

```yaml
workbench:
  toolbar:
    - region: workspace
      items:
        - commandId: platform.theme.toggle
          icon: sun
          label: Toggle Theme
          order: 10
        - commandId: workbench.view.refresh
          icon: refresh
          order: 20
```

| Field               | Required    | Description                                                  |
| ------------------- | ----------- | ------------------------------------------------------------ |
| `region`            | Yes         | Shell region: `workspace`, `sidebar`, `header`, `status-bar` |
| `items`             | Yes         | Toolbar button descriptors                                   |
| `items[].commandId` | Yes         | Must reference a registered command id                       |
| `items[].icon`      | Recommended | Design system icon key                                       |
| `items[].label`     | Optional    | Tooltip; defaults to command label                           |
| `items[].order`     | Optional    | Default `100`                                                |

Toolbar items do not redeclare handlers — they reference commands by id.

### Context predicate schema (`contextWhen`)

```yaml
contextWhen:
  surfaces: [workspace, sidebar, activity-bar]
  selectionKinds: [none, single, multi]
  contextTypes: [example.item] # matches Context Engine type
```

All fields optional. Empty or omitted `contextWhen` means command available in all contexts (subject to permission).

### Validation rules

1. **`workbench.commands` is optional** — manifests without it validate unchanged.
2. **`workbench.toolbar` is optional** — independent of commands array.
3. **Strict object** — unknown keys fail when block present (consistent with ADR-0022).
4. **Id uniqueness** — command `id` unique across registry; enforced at extraction/index time.
5. **Toolbar reference integrity** — each `commandId` must resolve to a command from same capability or built-in catalogue; unresolved refs fail extraction with warning (non-fatal) or error (fatal — configurable; default **warn and omit item** in Sprint 004).
6. **Shortcut normalisation** — stored as declared string; ShortcutRegistry normalises Ctrl/Meta at registration (AF-014 spec).

### Permission key convention

Follow ADR-0023 dot notation:

```text
platform.command.{commandId-segment}.execute
platform.theme.manage
platform.nav.{workspace}.view
```

Manifest may declare explicit `permission` on each command. When omitted, command is visible to all authenticated users (same as navigation items without permission).

### Extraction and hydration

| Step              | Location                           | Output                                    |
| ----------------- | ---------------------------------- | ----------------------------------------- |
| Runtime bootstrap | `@apzhub/platform-runtime`         | Active capabilities in registry           |
| Extract commands  | `@apzhub/command-framework`        | `CommandDto[]`                            |
| Server filter     | `@apzhub/command-framework/server` | Permission-filtered DTO                   |
| Client hydrate    | `apps/web`                         | `CommandRegistryDto` serialised to client |
| Register          | Client bootstrap                   | `CommandRegistry` populated               |

Extraction reads capability payloads — **does not modify Manifest Engine envelope** in AF-004 unless Zod schema addition is required. Schema addition is additive in `manifest-engine/schemas/workbench.ts` (same pattern as ADR-0022 Phase 2).

### Example — theme capability

```yaml
manifestSchemaVersion: "1.0"
id: default-theme
name: Default Theme
version: 1.0.0
kind: theme

workbench:
  commands:
    - id: platform.theme.toggle
      label: Toggle Theme
      handler: service:theme-service:toggle
      permission: platform.theme.manage
      shortcut: Ctrl+Shift+T
      palette: true
      group: appearance
      icon: sun
  toolbar:
    - region: workspace
      items:
        - commandId: platform.theme.toggle
          icon: sun
```

### Example — existing manifest unchanged

```yaml
# No workbench.commands — validates unchanged
manifestSchemaVersion: "1.0"
id: button
kind: component
# ...
```

## Alternatives

| Alternative                             | Why rejected                                             |
| --------------------------------------- | -------------------------------------------------------- |
| Root-level `commands:` sibling          | Inconsistent with ADR-0022 `workbench` grouping          |
| Separate `commands.yaml` per capability | Splits source of truth; complicates discovery            |
| Required commands on all modules        | Breaks additive validation rule                          |
| Toolbar inline handlers                 | Duplicates command definitions; violates DRY             |
| JSON Schema only in command-framework   | Manifest Engine must validate at discovery for fail-fast |

## Consequences

- AF-004 adds Zod schema extension to manifest-engine (additive)
- AF-005 implements server filter parallel to `filterWorkbenchRegistryDto()`
- AF-009 registers built-in `workbench.*` commands without manifest entries
- AF-019 adds scaffold commands to theme/platform manifests
- Document 019 palette UX consumes filtered command list — no manifest change to Document 019
- SDK documents 025–029 are **not modified** — `workbench` block remains platform extension per ADR-0022 precedent
- Milestone 8 RBAC populates permission keys — structure ready now
