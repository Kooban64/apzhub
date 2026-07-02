# AF-015 — Completion Report

> **Story:** AF-015 — Shell global shortcut listener  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-016**

---

## Objective

Integrate the Shortcut Registry into the Workbench shell so keyboard shortcuts execute globally through the existing Action Framework execution pipeline.

---

## Acceptance criteria

| Criterion                                                         | Status |
| ----------------------------------------------------------------- | ------ |
| Global shell keydown listener                                     | ✅     |
| Shortcut Registry integration                                     | ✅     |
| Workbench API / Action Framework invocation                       | ✅     |
| React context wiring                                              | ✅     |
| Shortcut diagnostics                                              | ✅     |
| Dependency injection                                              | ✅     |
| Existing execution pipeline preserved                             | ✅     |
| Command Palette shortcut remains shell concern                    | ✅     |
| Registry Pattern documentation                                    | ✅     |
| No toolbar, context menus, voice, gestures, business capabilities | ✅     |
| All quality gates pass                                            | ✅     |

---

## Architecture summary

```text
DesktopShell (enableGlobalShortcuts)
    └─ GlobalShortcutsLayer
           └─ useGlobalShortcuts()
                  ├─ ShortcutRegistry.resolve(event)
                  └─ useCommandRegistry().execute(actionId)
                         └─ ActionExecutor → bridge → Workbench

CommandRegistryProvider
    ├─ registry (ActionRegistry DTO hydration)
    └─ shortcuts (ShortcutRegistry from action.shortcut fields)
```

### Execution pipeline (mandatory path)

```text
ShortcutRegistry → useCommandRegistry().execute → ActionExecutor → WorkbenchCommandBridge → Workbench
```

No direct bridge invocation from the shell listener.

### Palette separation preserved

`Ctrl+Shift+P` / `Cmd+Shift+P` remains in `palette-shortcut.ts` — excluded from `useGlobalShortcuts` via `isCommandPaletteShortcut` guard.

---

## Files added / modified

| Package           | File                                                | Change                                  |
| ----------------- | --------------------------------------------------- | --------------------------------------- |
| command-framework | `react/command-registry-context.tsx`                | Shortcut registry in context            |
| command-framework | `react/use-shortcut-registry.ts`                    | **New** hook                            |
| command-framework | `react/use-shortcut-registry.test.tsx`              | **New**                                 |
| command-framework | `react/use-command-registry.ts`                     | Expose shortcut fields                  |
| command-framework | `react/use-command-registry.test.tsx`               | Shortcut context tests                  |
| command-framework | `react/index.ts`                                    | Export shortcut hooks/types             |
| workspace         | `desktop-shell/global-shortcuts.ts`                 | **New** listener                        |
| workspace         | `desktop-shell/global-shortcuts.test.ts`            | **New**                                 |
| workspace         | `desktop-shell/global-shortcut-diagnostics.ts`      | **New**                                 |
| workspace         | `desktop-shell/global-shortcut-diagnostics.test.ts` | **New**                                 |
| workspace         | `desktop-shell.tsx`                                 | `enableGlobalShortcuts`, layer wiring   |
| workspace         | `desktop-shell-global-shortcuts.test.tsx`           | **New** integration tests               |
| workspace         | `command-palette/workbench-surfaces.ts`             | `KEYBOARD_SHORTCUT_SURFACE` implemented |
| docs              | `specs/SPR-004-AF-shortcut-integration.md`          | **New** integration summary             |
| docs              | `architecture/APZHUB-Registry-Pattern.md`           | **New** Registry Pattern notes          |
| docs              | `sprint/AF-015-completion-report.md`                | This report                             |

---

## Test results

| Suite                                     | Tests                   |
| ----------------------------------------- | ----------------------- |
| `global-shortcuts.test.ts`                | 5 (new)                 |
| `global-shortcut-diagnostics.test.ts`     | 1 (new)                 |
| `desktop-shell-global-shortcuts.test.tsx` | 2 (new)                 |
| `use-shortcut-registry.test.tsx`          | 3 (new)                 |
| Updated react / palette tests             | +2                      |
| **Monorepo total**                        | **605** (+12 vs AF-014) |

### Scenarios covered

- Global keydown resolves and executes via `useCommandRegistry().execute`
- `preventDefault` on handled shortcuts
- Palette chord excluded when both surfaces enabled
- Focus guards: editable fields, palette input, modal open
- React context exposes shortcuts + diagnostics
- `useShortcutRegistry` resolve/lookup
- Existing palette shortcut test unchanged
- Shell diagnostics builder

---

## Coverage

| Area                                                   | Status     |
| ------------------------------------------------------ | ---------- |
| `workspace/src/desktop-shell/global-shortcuts.ts`      | ✅ Covered |
| `command-framework/src/react/use-shortcut-registry.ts` | ✅ Covered |
| All package thresholds                                 | ✅ Pass    |
| Monorepo statements                                    | ✅ 90.83%  |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 605 passed |
| `pnpm test:coverage` | ✅ Pass       |

---

## Technical debt

| ID         | Item                                                                            | Target                   |
| ---------- | ------------------------------------------------------------------------------- | ------------------------ |
| TD-AF15-01 | `enableGlobalShortcuts` not wired in `apps/web`                                 | AF-020                   |
| TD-AF15-02 | Global shortcuts do not pass action args (context-dependent actions)            | AF-016+ / context engine |
| TD-AF15-03 | `buildGlobalShortcutShellDiagnostics` execution counters not wired in shell yet | AF-020 telemetry         |
| TD-AF15-04 | Platform catalogue has no default shortcuts                                     | AF-019 scaffolds         |
| TD-AF15-05 | Scoped/context shortcuts (selection-aware)                                      | AF-016+                  |

---

## Recommendations for AF-016

1. **Context menu API** — extend `CommandRegistry.list()` with surface/selection/context filters per surfaces spec.
2. **Context menu UI** — presentational component in `@apzhub/ui`; shell wiring on workspace region.
3. **Do not merge** context menu registration into ShortcutRegistry — separate surface, same execution path.
4. **Reuse focus guards** from `global-shortcuts.ts` patterns where applicable.
5. **Keep** global shortcut listener unchanged — context menus are pointer-driven.

---

## Registry Pattern

See [APZHUB Registry Pattern](../architecture/APZHUB-Registry-Pattern.md) — emerging pattern documented from ActionRegistry + ShortcutRegistry implementations.

---

AF-015 complete. **Do not begin AF-016** until this report is reviewed and approved.
