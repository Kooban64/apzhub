# SPR-004 — Shortcut Shell Integration Summary (AF-015)

> **Story:** AF-015 — Shell global shortcut listener  
> **Authority:** [AF-014 Shortcut Registry spec](./SPR-004-AF-shortcut-registry.md) · [ADR-0024](../adr/ADR-0024-command-framework-package.md)

---

## Objective

Integrate `ShortcutRegistry` into the Workbench shell so manifest-declared keyboard shortcuts execute through the existing Action Framework pipeline.

---

## Execution pipeline

```text
User keydown (window)
        ↓
useGlobalShortcuts (DesktopShell)
        ↓
ShortcutRegistry.resolve(event) → actionId
        ↓
useCommandRegistry().execute(actionId)
        ↓
ActionExecutor (injected — DefaultActionExecutor in production)
        ↓
WorkbenchCommandBridge.toAction / toRequest
        ↓
workbenchExecute → Request Bus → Workbench
```

**No alternative execution paths.** The Shortcut Registry resolves ids only; the shell never calls bridge or request bus directly.

---

## Shell components

| File                                                                  | Role                                            |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| `packages/workspace/src/desktop-shell/global-shortcuts.ts`            | Global keydown listener + focus guards          |
| `packages/workspace/src/desktop-shell/global-shortcut-diagnostics.ts` | Shell-level shortcut diagnostics builder        |
| `packages/workspace/src/desktop-shell.tsx`                            | `enableGlobalShortcuts`, `GlobalShortcutsLayer` |
| `packages/command-framework/src/react/command-registry-context.tsx`   | Hydrates `shortcuts` from server DTO            |
| `packages/command-framework/src/react/use-shortcut-registry.ts`       | React hook for shortcut bindings                |

---

## DesktopShell API

```typescript
interface DesktopShellProps {
  readonly enableGlobalShortcuts?: boolean;
  readonly modalOpen?: boolean;
  readonly onShortcutExecuted?: (commandId: string) => void;
}
```

Requires `CommandRegistryProvider` ancestor (same as Command Palette).

---

## Focus and chord guards

| Guard                     | Behaviour                                                   |
| ------------------------- | ----------------------------------------------------------- |
| Unrelated editable fields | Ignored (`input`, `textarea`, `select`, `contentEditable`)  |
| Command Palette input     | Ignored when focus inside `[data-testid="command-palette"]` |
| Open modal                | Ignored when `modalOpen={true}`                             |
| Palette open chord        | Ignored — handled by `useCommandPaletteShortcut` (AF-012)   |

---

## React context wiring

`CommandRegistryProvider` now exposes:

```typescript
interface CommandRegistryContextValue {
  readonly registry: ReadOnlyActionRegistry;
  readonly shortcuts: ShortcutRegistry;
  readonly shortcutDiagnostics: ShortcutRegistryDiagnostics;
  readonly shortcutConflicts: readonly ShortcutConflict[];
  readonly executor: ActionExecutor;
  // ...
}
```

Hooks:

- `useCommandRegistry()` — includes `shortcuts`, `shortcutDiagnostics`, `shortcutConflicts`
- `useShortcutRegistry()` — shortcut-focused accessor

---

## Diagnostics

Shell diagnostics via `buildGlobalShortcutShellDiagnostics()`:

```typescript
interface GlobalShortcutShellDiagnostics {
  readonly surface: "keyboard-shortcut";
  readonly registryReady: boolean;
  readonly registrationCount: number;
  readonly conflictCount: number;
  readonly executionCount: number;
  readonly lastExecutedActionId?: string;
  readonly lastExecutionOk?: boolean;
}
```

Registry diagnostics originate from `ShortcutRegistry.getDiagnostics()` hydrated at DTO import.

---

## Separation from Command Palette

| Concern                                     | Owner                                     |
| ------------------------------------------- | ----------------------------------------- |
| `Ctrl+Shift+P` / `Cmd+Shift+P` palette open | `palette-shortcut.ts` (shell)             |
| Manifest action shortcuts                   | `ShortcutRegistry` + `useGlobalShortcuts` |

The palette chord is explicitly excluded from global shortcut handling even if accidentally registered.

---

## Prerequisites for app wiring (AF-020)

1. Mount `CommandRegistryProvider` with server DTO + production `DefaultActionExecutor`
2. Set `DesktopShell enableGlobalShortcuts={true}`
3. Declare `shortcut` on manifest actions (AF-014 bootstrap)

---

_Shortcut shell integration — AF-015 complete. Context menus deferred to AF-016._
