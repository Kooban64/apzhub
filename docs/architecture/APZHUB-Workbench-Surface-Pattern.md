# APZHUB Workbench Surface Pattern

> **Status:** Engineering documentation (AF-017)  
> **Scope:** Shared presentation pattern for shell regions that expose platform actions

---

## Overview

A **Workbench Surface** is a UI region that **presents** actions from the read-only Action Registry and **invokes** them through the Workbench API. Surfaces are thin presentation layers — they do not own business logic, permission evaluation, or action registration.

This pattern applies to Action Framework surfaces and aligns with the broader workbench shell regions documented in Milestone 3.

---

## Surfaces in this pattern

| Surface           | Package / path                          | Story  | Status       |
| ----------------- | --------------------------------------- | ------ | ------------ |
| Activity Bar      | `@apzhub/ui` / `shell-layout`           | M3     | Shell chrome |
| Sidebar           | `@apzhub/ui` / `sidebar`                | M3     | Shell chrome |
| View (main)       | `@apzhub/ui` / `shell-layout` `<main>`  | M3     | Content area |
| Panel             | Workbench layout (future)               | Future | Planned      |
| Status Bar        | `@apzhub/ui` / `status-bar`             | M3     | Shell chrome |
| Command Palette   | `@apzhub/workspace` / `command-palette` | AF-011 | Implemented  |
| Context Menu      | `@apzhub/workspace` / `context-menu`    | AF-016 | Implemented  |
| Toolbar           | `@apzhub/workspace` / `toolbar`         | AF-017 | Implemented  |
| Keyboard Shortcut | `@apzhub/workspace` / `desktop-shell`   | AF-015 | Implemented  |

Shell chrome regions (Activity Bar, Sidebar, Status Bar) are structural layout components. Action Framework surfaces (Palette, Context Menu, Toolbar, Shortcuts) consume the hydrated registry and delegate execution to the injected `ActionExecutor`.

---

## Common flow

```text
Server ActionRegistryDto (permission-filtered)
        ↓
CommandRegistryProvider (hydration + DI)
        ↓
Workbench Surface component
        ├─ Read actions (list / get / toolbar regions)
        ├─ Map to presentation model
        └─ Render @apzhub/ui component
        ↓
useCommandRegistry().execute(commandId)
        ↓
ActionExecutor → WorkbenchCommandBridge → Workbench
```

---

## Responsibilities

### Surfaces **do**

- Consume the read-only Action Registry via `useCommandRegistry()` or context
- Map descriptors/DTO items to presentational row/button models
- Invoke `execute()` with actor `user` on user interaction
- Report surface-specific diagnostics

### Surfaces **do not**

- Register, replace, or remove actions
- Execute handlers directly (service calls, bridge internals)
- Evaluate permissions client-side
- Maintain parallel registries or handler maps

---

## Surface catalogue

Implemented Action Framework surfaces are registered in:

`packages/workspace/src/command-palette/workbench-surfaces.ts`

Each surface exports a `WorkbenchSurfaceDefinition` with:

- `id` — stable surface identifier
- `status` — `implemented` | `planned`
- `consumes` — always `read-only-action-registry` for AF surfaces
- `description` — human-readable summary

---

## Data sources by surface

| Surface           | Registry access pattern                           |
| ----------------- | ------------------------------------------------- |
| Command Palette   | `list({ query, palette })`                        |
| Context Menu      | `list({ surface, selection, context })`           |
| Toolbar           | `toolbar` DTO regions + `registry.get(commandId)` |
| Keyboard Shortcut | `shortcuts.resolve(event)` → `execute(commandId)` |

---

## Dependency injection

All Action Framework surfaces require:

1. **`CommandRegistryProvider`** — hydrates registry, shortcuts, and toolbar DTO from server payload
2. **`ActionExecutor`** — injected executor (placeholder until AF-020 app wiring)

Optional surface-specific providers:

- `ContextMenuProvider` — open/anchor state (AF-016)
- `ToolbarProvider` — active region context (AF-017)

---

## Adding a new surface

1. Define presentation component in `@apzhub/ui` (no registry imports)
2. Add workspace surface module with mapper, diagnostics, and tests
3. Export `WorkbenchSurfaceDefinition` with `status: "implemented"`
4. Wire opt-in flag on `DesktopShell` (or app shell)
5. Document in `docs/specs/SPR-004-AF-*.md`
6. Extend this pattern doc if the surface fits the catalogue

---

## Related

- [APZHUB Registry Pattern](./APZHUB-Registry-Pattern.md)
- [SPR-004 AF Surfaces](../specs/SPR-004-AF-surfaces.md)
- [ADR-0024 — Command Framework Package](../adr/ADR-0024-command-framework-package.md)
