# AF-016 — Completion Report

> **Story:** AF-016 — Context Menu Workbench Surface  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-017**

---

## Objective

Implement the Context Menu Workbench Surface — presenting context-appropriate actions from the read-only Action Registry with no new execution mechanisms.

---

## Acceptance criteria

| Criterion                                              | Status |
| ------------------------------------------------------ | ------ |
| Context Menu provider                                  | ✅     |
| Context-aware action filtering                         | ✅     |
| Presentational Context Menu component                  | ✅     |
| Selection/context integration                          | ✅     |
| Diagnostics                                            | ✅     |
| Dependency injection                                   | ✅     |
| Uses existing Action Registry + Workbench API path     | ✅     |
| Action Visibility model documented (no implementation) | ✅     |
| No register/execute-direct/permissions/own registry    | ✅     |
| No toolbar, AI, voice, business capabilities           | ✅     |
| All quality gates pass                                 | ✅     |

---

## Architecture summary

```text
Right-click workspace region
        ↓
ContextMenuProvider.openFromMouseEvent()
        ↓
WorkbenchContextMenu
        ├─ list({ surface, selection, context })   ← context-filter.ts
        ├─ mapActionsToContextMenuItems()
        └─ ContextMenu (@apzhub/ui)
        ↓
useCommandRegistry().execute(actionId)
        ↓
ActionExecutor → WorkbenchCommandBridge → Workbench
```

---

## Files added / modified

| Package           | File                                    | Change                                  |
| ----------------- | --------------------------------------- | --------------------------------------- |
| command-framework | `registry/context-filter.ts`            | **New** — predicate filter              |
| command-framework | `registry/context-filter.test.ts`       | **New**                                 |
| command-framework | `registry/filter-action-descriptors.ts` | Wired selection/context                 |
| command-framework | `registry/action-registry.ts`           | Typed list options                      |
| ui                | `components/context-menu/`              | **New** presentational menu             |
| workspace         | `context-menu/`                         | Provider, surface, diagnostics, mapping |
| workspace         | `desktop-shell.tsx`                     | `enableContextMenu` integration         |
| workspace         | `command-palette/workbench-surfaces.ts` | `CONTEXT_MENU_SURFACE`                  |
| docs              | `specs/SPR-004-AF-context-menu.md`      | **New** specification                   |
| docs              | `context-menu/ACTION-VISIBILITY.md`     | **New** visibility notes                |

---

## Test results

| Suite                                 | Tests                   |
| ------------------------------------- | ----------------------- |
| `context-filter.test.ts`              | 6 (new)                 |
| `context-menu.test.tsx`               | 6 (new)                 |
| `workbench-context-menu.test.tsx`     | 6 (new)                 |
| `desktop-shell-context-menu.test.tsx` | 1 (new)                 |
| Mapper/diagnostics tests              | 4 (new)                 |
| Registry list integration             | +1                      |
| **Monorepo total**                    | **629** (+24 vs AF-015) |

### Scenarios covered

- Surface, selection kind, and context type filtering
- Empty context menu state
- Disabled action presentation (no execute)
- Menu rendering and Escape close
- Execution via `useCommandRegistry().execute`
- Diagnostics reporting
- DesktopShell right-click wiring

---

## Coverage

| Area                                      | Status     |
| ----------------------------------------- | ---------- |
| `command-framework/.../context-filter.ts` | ✅ Covered |
| `ui/.../context-menu/`                    | ✅ ~93%    |
| `workspace/.../context-menu/`             | ✅ ~98%    |
| Monorepo statements                       | ✅ 91.10%  |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 629 passed |
| `pnpm test:coverage` | ✅ Pass       |

---

## Technical debt

| ID         | Item                                                                         | Target            |
| ---------- | ---------------------------------------------------------------------------- | ----------------- |
| TD-AF16-01 | `enableContextMenu` not wired in `apps/web`                                  | AF-020            |
| TD-AF16-02 | Selection/context snapshots passed as props — not live workbench subscribers | AF-020            |
| TD-AF16-03 | Action Visibility model documented only                                      | Future server DTO |
| TD-AF16-04 | axe accessibility audit deferred                                             | Future CI story   |
| TD-AF16-05 | Context menu grouping/separators not implemented                             | Future UX pass    |

---

## Recommendations for AF-017

1. **Toolbar manifest + shell** — render `ActionRegistryDto.toolbar` regions; `workspace` region first.
2. **Reuse** `mapActionsToPaletteItems` patterns for toolbar button presentation.
3. **Execute** via `useCommandRegistry().execute()` — same pipeline as context menu.
4. **Do not** duplicate toolbar registry — reference action ids from hydration DTO only.
5. **Keep** context menu unchanged in AF-017 scope.

---

## Action Visibility

See [ACTION-VISIBILITY.md](../../packages/workspace/src/context-menu/ACTION-VISIBILITY.md) — Hidden / Visible-disabled / Visible-enabled model (documentation only).

---

AF-016 complete. **Do not begin AF-017** until this report is reviewed and approved.
