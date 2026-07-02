# AF-011 — Completion Report

> **Story:** AF-011 — Command Palette Workbench Surface  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete (post-review correction applied) — **await approval before AF-012**

---

## Objective

Implement the Command Palette as the first Workbench Surface for the Action Framework — a presentation layer that consumes the read-only Action Registry via `useCommandRegistry()`.

---

## Acceptance criteria

| Criterion                                                    | Status                     |
| ------------------------------------------------------------ | -------------------------- |
| Command Palette presentational component (`@apzhub/ui`)      | ✅                         |
| Shell integration (`@apzhub/workspace`)                      | ✅                         |
| Palette open/close state                                     | ✅                         |
| Registry rendering from `useCommandRegistry()`               | ✅                         |
| Keyboard navigation (Up/Down, Enter, Escape)                 | ✅                         |
| Execute selected action via injected executor                | ✅                         |
| Diagnostics                                                  | ✅                         |
| Accessible dialog + listbox pattern                          | ✅                         |
| Design tokens only (no hardcoded colours)                    | ✅                         |
| No registration, permissions, fuzzy search, global shortcuts | ✅                         |
| Quality gates (lint, typecheck, build, test, e2e)            | ✅                         |
| Coverage threshold (workbench-framework branches)            | ✅ (corrected post-review) |

---

## Command Palette architecture summary

### Layer separation

```text
useCommandRegistry()          ← read-only registry + executor (AF-010)
        ↓
WorkbenchCommandPalette       ← @apzhub/workspace (surface + state + diagnostics)
        ↓
CommandPalette                ← @apzhub/ui (presentation only)
```

| Layer                                    | Responsibility                         | Does NOT                                 |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------- |
| `CommandPalette` (ui)                    | Modal UI, keyboard nav, list rendering | Register actions, execute business logic |
| `WorkbenchCommandPalette` (workspace)    | Registry filter, execute, diagnostics  | Evaluate permissions, fuzzy search       |
| `useCommandRegistry` (command-framework) | DI from server DTO                     | Mutate registry                          |

### Component API (`@apzhub/ui`)

```typescript
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: readonly CommandPaletteItem[];
  onSelect: (commandId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  isReady?: boolean;
  executionFeedback?: CommandPaletteExecutionFeedback | null;
  diagnostics?: CommandPaletteDiagnostics;
}
```

### Shell integration (`@apzhub/workspace`)

| Export                                  | Role                                               |
| --------------------------------------- | -------------------------------------------------- |
| `WorkbenchCommandPalette`               | Surface wired to `useCommandRegistry()`            |
| `useCommandPaletteState`                | Open/close + query state (controlled/uncontrolled) |
| `buildCommandPaletteDiagnostics`        | Surface-level reporting                            |
| `DesktopShell` + `enableCommandPalette` | Optional palette mount                             |

### Execution flow

```text
User selects command
    → CommandPalette.onSelect(id)
    → WorkbenchCommandPalette.handleSelect
    → useCommandRegistry().execute(id, { actor: "user" })
    → ActionExecutor (injected)
    → palette closes + execution feedback displayed
```

---

## Workbench Surface documentation

Documented in `packages/workspace/src/command-palette/workbench-surfaces.ts`:

| Surface             | Status        | Story  |
| ------------------- | ------------- | ------ |
| **Command Palette** | `implemented` | AF-011 |
| Toolbar             | `planned`     | AF-017 |
| Context Menu        | `planned`     | AF-016 |
| Keyboard Shortcut   | `planned`     | AF-014 |
| AI Assistant        | `planned`     | Future |
| Voice Interface     | `planned`     | Future |

All surfaces consume `read-only-action-registry` — they present and invoke actions; they do not register actions or evaluate permissions.

---

## Registry diagnostics

`CommandPaletteSurfaceDiagnostics` extends palette diagnostics with:

| Field                                                    | Description                    |
| -------------------------------------------------------- | ------------------------------ |
| `surface`                                                | `"command-palette"`            |
| `open`                                                   | Palette visibility             |
| `visibleCommandCount`                                    | Filtered command count         |
| `registryReady`                                          | From client registry hydration |
| `registryActionCount`                                    | Total hydrated actions         |
| `executionCount`                                         | Invocations via palette        |
| `lastExecutionAt` / `lastExecutionOk` / `lastSelectedId` | Last execution metadata        |

---

## Files added / modified

| Package   | File                                             | Change                          |
| --------- | ------------------------------------------------ | ------------------------------- |
| ui        | `components/command-palette/command-palette.tsx` | **New** — presentational modal  |
| ui        | `components/command-palette/types.ts`            | **New**                         |
| workspace | `command-palette/workbench-command-palette.tsx`  | **New** — surface               |
| workspace | `command-palette/use-command-palette-state.ts`   | **New**                         |
| workspace | `command-palette/command-palette-diagnostics.ts` | **New**                         |
| workspace | `command-palette/workbench-surfaces.ts`          | **New** — surface catalogue     |
| workspace | `desktop-shell.tsx`                              | `enableCommandPalette` prop     |
| workspace | `package.json`                                   | `@apzhub/command-framework` dep |
| Tests     | UI + workspace palette tests                     | **New** — 18 tests              |
| Docs      | `README` (via CHANGELOG)                         | Updated                         |

---

## Test results

| Suite                                | Tests                                             |
| ------------------------------------ | ------------------------------------------------- |
| `command-palette.test.tsx` (ui)      | 8                                                 |
| `workbench-command-palette.test.tsx` | 6                                                 |
| `use-command-palette-state.test.ts`  | 4                                                 |
| `map-action-executor-result.test.ts` | 5 (correction)                                    |
| `action-payload.test.ts`             | +5 cases (correction)                             |
| `server.test.ts`                     | +3 cases (correction)                             |
| **Monorepo total**                   | **544** (+17 vs AF-010; +17 correction on AF-011) |

### Scenarios covered

- Palette rendering with mock commands
- Empty registry state
- Loading state when registry not ready
- Arrow key navigation + Enter selection
- Escape closes palette
- Click selection
- Execution feedback display
- Registry filter via query (`list({ query })`)
- Execute + close via `useCommandRegistry`
- Controlled open state
- Surface diagnostics builder
- Workbench surface catalogue

---

## Coverage

| Area                                            | Threshold | Status    |
| ----------------------------------------------- | --------- | --------- |
| `packages/ui/src/components/command-palette/**` | 80%       | ✅ Meets  |
| `packages/workspace/src/command-palette/**`     | 80%       | ✅ Meets  |
| `workbench-framework` branches (aggregate)      | 80%       | ✅ 81.10% |

### Post-review correction (AF-011 approval)

Added meaningful branch-coverage tests in `@apzhub/workbench-framework` — no threshold changes:

| File                                     | Tests added                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `api/action-payload.test.ts`             | All action payload shapes and optional fields                |
| `api/map-action-executor-result.test.ts` | **New** — executor result → workbench request mapping        |
| `server.test.ts`                         | Registry helper exports and auth permission context branches |

Monorepo total after correction: **544 tests** (+17).

---

## Quality gates

| Gate                 | Result                                        |
| -------------------- | --------------------------------------------- |
| `pnpm lint`          | ✅ Pass                                       |
| `pnpm typecheck`     | ✅ Pass                                       |
| `pnpm build`         | ✅ Pass                                       |
| `pnpm test`          | ✅ 544 passed                                 |
| `pnpm test:coverage` | ✅ Pass (workbench-framework branches 81.10%) |
| `pnpm test:e2e`      | ✅ 15 passed                                  |

---

## Technical debt

| ID         | Item                                                       | Target            |
| ---------- | ---------------------------------------------------------- | ----------------- |
| TD-AF11-02 | `enableCommandPalette` not wired in `apps/web`             | AF-020            |
| TD-AF11-03 | No axe component test — e2e axe covers shell               | AF-013 / optional |
| TD-AF11-04 | Focus trap is input-centric only (no full roving tabindex) | AF-012 polish     |
| TD-AF11-05 | Global shortcut to open palette                            | AF-012            |

---

## Recommendations for AF-012

1. **Global shortcut** — wire `Ctrl+Shift+P` / `Cmd+Shift+P` in DesktopShell to `useCommandPaletteState().openPalette()`.
2. **Fuzzy search** — replace substring `list({ query })` filter with ranked fuzzy matching (document dep if adding fuse.js).
3. **Search debounce** — ≤ 100ms debounce on query input before registry filter.
4. **Do not implement** ShortcutRegistry for arbitrary commands (AF-014) or toolbar (AF-017).
5. **Wire app** in AF-020 — `CommandRegistryProvider` + `enableCommandPalette` on `DesktopShell`.

---

AF-011 complete. **Do not begin AF-012** until this report is reviewed and approved.
