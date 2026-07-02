# SPR-004 — Toolbar Specification (AF-017)

> **Story:** AF-017 — Toolbar Workbench Surface  
> **Authority:** [ADR-0024](../adr/ADR-0024-command-framework-package.md) · [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) · [Workbench Surface Pattern](../architecture/APZHUB-Workbench-Surface-Pattern.md)

---

## Objective

Present toolbar-designated actions from the hydrated `ActionRegistryDto.toolbar` regions — **no new execution mechanisms**.

---

## Architecture

```text
ActionRegistryDto.toolbar (server-filtered)
        ↓
ToolbarProvider (region context)
        ↓
WorkbenchToolbar
        ├─ filterToolbarRegionItems(toolbar, region)
        ├─ mapToolbarItems(regionItems, registry)
        └─ Toolbar (presentation)
        ↓
useCommandRegistry().execute(actionId)
        ↓
ActionExecutor → WorkbenchCommandBridge → Workbench
```

---

## Region filtering (`@apzhub/command-framework`)

File: `packages/command-framework/src/toolbar/filter-toolbar-region.ts`

| Function                   | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `findToolbarRegion`        | Locate region by id                             |
| `sortToolbarItems`         | Sort by `order` (default 100)                   |
| `filterToolbarRegionItems` | Return sorted items for region; `[]` if missing |

Toolbar layout is **DTO-driven** — not `registry.list()`. Action metadata is resolved via `registry.get(commandId)`.

---

## Package layout

| Package           | Path                               | Role                                 |
| ----------------- | ---------------------------------- | ------------------------------------ |
| command-framework | `toolbar/filter-toolbar-region.ts` | Pure region filter + sort            |
| ui                | `components/toolbar/`              | Presentational toolbar buttons       |
| workspace         | `toolbar/`                         | Provider, shell surface, diagnostics |

---

## React API

### Provider

```typescript
<ToolbarProvider region="workspace">
  <WorkbenchToolbar onExecuted={...} />
</ToolbarProvider>
```

### DesktopShell

```typescript
<DesktopShell enableToolbar toolbarRegion="workspace" onToolbarExecuted={...} />
```

Requires `CommandRegistryProvider` ancestor.

---

## Regions (Sprint 004)

| Region       | Status in AF-017                           |
| ------------ | ------------------------------------------ |
| `workspace`  | Implemented — default region               |
| `header`     | Supported by filter; empty unless hydrated |
| `sidebar`    | Supported by filter; empty unless hydrated |
| `status-bar` | Supported by filter; empty unless hydrated |

---

## Architectural constraints

The Toolbar:

- Is a Workbench Surface
- Consumes the Action Registry (DTO regions + `get()` lookup)
- Executes through `useCommandRegistry().execute()`

The Toolbar must **not**:

- Register actions
- Execute actions directly
- Evaluate permissions
- Maintain its own registry

---

## Diagnostics

`buildToolbarDiagnostics()` reports:

| Field                  | Description             |
| ---------------------- | ----------------------- |
| `surface`              | `"toolbar"`             |
| `region`               | Active toolbar region   |
| `visibleActionCount`   | Rendered button count   |
| `registryReady`        | Client hydration status |
| `executionCount`       | Invocations via toolbar |
| `lastExecutedActionId` | Last selected action    |
| `lastExecutionOk`      | Last execution result   |

Hidden span: `data-testid="toolbar-diagnostics"`.

---

## Out of scope (AF-017)

- Toolbar customisation
- Drag-and-drop reordering
- AI actions, voice input, business capabilities
- Manifest extraction wiring (`apps/web` → AF-020)

---

## Related

- [Action Visibility notes](../../packages/workspace/src/context-menu/ACTION-VISIBILITY.md)
- [AF-016 Context Menu](./SPR-004-AF-context-menu.md)
