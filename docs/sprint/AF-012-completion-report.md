# AF-012 — Completion Report

> **Story:** AF-012 — Palette activation shortcut and fuzzy search  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-07-01  
> **Status:** Complete — **await review before AF-013**

---

## Objective

Improve Command Palette activation and discovery with a global keyboard shortcut, fuzzy search ranking, and debounced query input — while preserving existing palette behaviour and presentation-only architecture.

---

## Acceptance criteria

| Criterion                                                      | Status |
| -------------------------------------------------------------- | ------ |
| Global shortcut `Ctrl+Shift+P` (Windows/Linux)                 | ✅     |
| Global shortcut `Cmd+Shift+P` (macOS)                          | ✅     |
| Shortcut opens Command Palette                                 | ✅     |
| Focus/input safety (skip unrelated editable fields)            | ✅     |
| Fuzzy search ranking                                           | ✅     |
| Debounced query input (75ms)                                   | ✅     |
| Keyboard navigation preserved                                  | ✅     |
| Execution flow preserved                                       | ✅     |
| Accessibility preserved                                        | ✅     |
| Presentation-only (no registration/permissions/business logic) | ✅     |
| No toolbar, context menus, history, AI, integrations           | ✅     |
| All quality gates pass                                         | ✅     |

---

## Command Palette architecture summary

### AF-012 additions

```text
DesktopShell (enableCommandPalette)
    ├─ useCommandPaletteShortcut()     ← global Ctrl/Cmd+Shift+P
    └─ WorkbenchCommandPalette
           ├─ useDebouncedValue(query, 75ms)
           ├─ searchActionDescriptors()  ← fuzzy ranking
           └─ CommandPalette (presentation)
```

| Layer                           | AF-012 responsibility                                             |
| ------------------------------- | ----------------------------------------------------------------- |
| `palette-shortcut.ts`           | Platform chord detection, editable-target safety, window listener |
| `search.ts` (command-framework) | Pure fuzzy scoring and ranked filter                              |
| `use-debounced-value.ts`        | Query debounce for filter (input remains immediate)               |
| `WorkbenchCommandPalette`       | Wires debounce + fuzzy search before presentation                 |
| `CommandPalette` (ui)           | Unchanged presentation contract                                   |

### Shortcut behaviour

| Platform      | Chord          | Implementation                       |
| ------------- | -------------- | ------------------------------------ |
| Windows/Linux | `Ctrl+Shift+P` | `ctrlKey && shiftKey && key === 'p'` |
| macOS         | `Cmd+Shift+P`  | `metaKey && shiftKey && key === 'p'` |

**Focus safety:** shortcut is ignored when focus is in `INPUT` / `TEXTAREA` / `SELECT` / `contentEditable` outside the palette. When the palette is open, the shortcut is not suppressed (palette combobox remains usable).

**Note:** Palette shortcut is a shell concern — separate from ShortcutRegistry (AF-014).

### Fuzzy search

Implemented without new dependencies (`packages/command-framework/src/registry/search.ts`):

| Match type              | Relative rank |
| ----------------------- | ------------- |
| Exact label / id        | Highest       |
| Prefix on label / id    | High          |
| Substring on label / id | Medium        |
| Word-start in label     | Medium-low    |
| Subsequence (fuzzy)     | Lowest        |

Empty query returns the full sorted registry list.

### Debounce

`COMMAND_PALETTE_QUERY_DEBOUNCE_MS = 75` — input updates immediately; registry filter uses debounced value.

---

## Files added / modified

| Package           | File                                            | Change                                  |
| ----------------- | ----------------------------------------------- | --------------------------------------- |
| command-framework | `registry/search.ts`                            | **New** — fuzzy scoring + ranked search |
| command-framework | `registry/search.test.ts`                       | **New**                                 |
| workspace         | `desktop-shell/palette-shortcut.ts`             | **New** — global shortcut               |
| workspace         | `desktop-shell/palette-shortcut.test.ts`        | **New**                                 |
| workspace         | `command-palette/use-debounced-value.ts`        | **New**                                 |
| workspace         | `command-palette/use-debounced-value.test.ts`   | **New**                                 |
| workspace         | `desktop-shell.tsx`                             | Shortcut + palette state layer          |
| workspace         | `command-palette/workbench-command-palette.tsx` | Fuzzy search + debounce                 |
| workspace         | `desktop-shell-palette.test.tsx`                | **New** — shortcut opens palette        |
| Tests             | Updated palette integration tests               | Debounced fuzzy filter                  |

---

## Test results

| Suite                            | Tests                              |
| -------------------------------- | ---------------------------------- |
| `search.test.ts`                 | 7 (new)                            |
| `palette-shortcut.test.ts`       | 7 (new)                            |
| `use-debounced-value.test.ts`    | 1 (new)                            |
| `desktop-shell-palette.test.tsx` | 1 (new)                            |
| Updated palette tests            | debounced fuzzy + existing flows   |
| **Monorepo total**               | **561** (+17 vs AF-011 correction) |

### Scenarios covered

- Fuzzy ranking: prefix beats substring; `theme` matches Toggle Theme
- Shortcut chord detection (macOS + Windows/Linux)
- Focus safety in unrelated inputs
- Palette combobox not treated as blocked input
- `useCommandPaletteShortcut` opens palette
- DesktopShell `Ctrl+Shift+P` opens dialog
- Debounced fuzzy filter in WorkbenchCommandPalette
- Keyboard navigation and execution flows (existing tests)

---

## Coverage

| Area                                              | Status     |
| ------------------------------------------------- | ---------- |
| `command-framework/src/registry/search.ts`        | ✅ Covered |
| `workspace/src/desktop-shell/palette-shortcut.ts` | ✅ Covered |
| `workbench-framework` branches                    | ✅ ≥ 80%   |
| All package thresholds                            | ✅ Pass    |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 561 passed |
| `pnpm test:coverage` | ✅ Pass       |
| `pnpm test:e2e`      | ✅ 15 passed  |

---

## Technical debt

| ID         | Item                                                              | Target           |
| ---------- | ----------------------------------------------------------------- | ---------------- |
| TD-AF12-01 | `enableCommandPalette` not wired in `apps/web`                    | AF-020           |
| TD-AF12-02 | ShortcutRegistry (AF-014) not used for palette open — intentional | AF-014           |
| TD-AF12-03 | Palette E2E (open/search/execute)                                 | AF-013           |
| TD-AF12-04 | Fuzzy algorithm is lightweight scoring — not full fuse-style      | Future if needed |

---

## Recommendations for AF-013

1. **Playwright E2E** — `spr-004-command-palette.spec.ts`: open via `Ctrl+Shift+P`, search partial label, execute command.
2. **Prerequisites** — wire `CommandRegistryProvider` + `enableCommandPalette` in app shell (AF-020) or use test fixture with provider.
3. **Do not add** global shortcut registry or toolbar — remain AF-014 / AF-017.
4. **Verify** existing 15 E2E tests remain green after app wiring.

---

AF-012 complete. **Do not begin AF-013** until this report is reviewed and approved.
