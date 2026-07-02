# SPR-004 — Context Menu Specification (AF-016)

> **Story:** AF-016 — Context Menu Workbench Surface  
> **Authority:** [ADR-0024](../adr/ADR-0024-command-framework-package.md) · [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) · [Document 019](../019-universal-command-palette-action-framework.md)

---

## Objective

Present context-appropriate actions from the read-only Action Registry in a right-click menu — **no new execution mechanisms**.

---

## Architecture

```text
Right-click (workspace region)
        ↓
ContextMenuProvider.openFromMouseEvent()
        ↓
WorkbenchContextMenu
        ├─ useCommandRegistry().list({ surface, selection, context })
        ├─ mapActionsToContextMenuItems()
        └─ ContextMenu (presentation)
        ↓
useCommandRegistry().execute(actionId)
        ↓
ActionExecutor → WorkbenchCommandBridge → Workbench
```

---

## Context filtering (`@apzhub/command-framework`)

File: `packages/command-framework/src/registry/context-filter.ts`

| Predicate field              | Matches against                       |
| ---------------------------- | ------------------------------------- |
| `contextWhen.surfaces`       | `list({ surface })`                   |
| `contextWhen.selectionKinds` | `list({ selection: { mode } })`       |
| `contextWhen.contextTypes`   | `list({ context: { contextTypes } })` |

Omitted `contextWhen` fields match all values for that dimension.

---

## Package layout

| Package           | Path                         | Role                                 |
| ----------------- | ---------------------------- | ------------------------------------ |
| command-framework | `registry/context-filter.ts` | Pure context predicate filter        |
| ui                | `components/context-menu/`   | Presentational menu                  |
| workspace         | `context-menu/`              | Provider, shell surface, diagnostics |

---

## React API

### Provider

```typescript
<ContextMenuProvider>
  <div onContextMenu={openFromMouseEvent}>...</div>
  <WorkbenchContextMenu selection={...} context={...} />
</ContextMenuProvider>
```

### DesktopShell

```typescript
<DesktopShell
  enableContextMenu
  contextMenuSurface="workspace"
  contextMenuInput={{ selectionMode: "single", contextTypes: ["record.item"] }}
/>
```

Requires `CommandRegistryProvider` ancestor.

---

## Presentation rules

The Context Menu **must not**:

- Register actions
- Execute actions directly (bypass `useCommandRegistry().execute`)
- Evaluate permissions
- Maintain its own registry

Disabled actions (`disabled: true`) render non-interactive items — presentation only.

---

## Diagnostics

`buildContextMenuDiagnostics()` reports:

- Surface id: `"context-menu"`
- Open state, visible action count
- Menu surface, selection mode, context type count
- Registry readiness and execution counters

---

## Action Visibility (future)

See [ACTION-VISIBILITY.md](../../packages/workspace/src/context-menu/ACTION-VISIBILITY.md) — Hidden / Visible-disabled / Visible-enabled model (documentation only).

---

## Tests

| Area                      | Location                              |
| ------------------------- | ------------------------------------- |
| Context filter            | `context-filter.test.ts`              |
| Registry list integration | `default-action-registry.test.ts`     |
| UI rendering              | `context-menu.test.tsx`               |
| Workbench surface         | `workbench-context-menu.test.tsx`     |
| Desktop shell wiring      | `desktop-shell-context-menu.test.tsx` |

---

_Context Menu — AF-016 complete. Toolbar deferred to AF-017._
