# AF-013 — Completion Report

> **Story:** AF-013 — Command Palette presentation enhancement  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-014**

---

## Objective

Enhance Command Palette discoverability and usability through richer presentation — icons, descriptions, shortcut badges, disabled rows, group separators, optional pinned actions, and improved empty/loading states — **without new execution behaviour**.

---

## Acceptance criteria

| Criterion                                                      | Status |
| -------------------------------------------------------------- | ------ |
| Action icons                                                   | ✅     |
| Action descriptions                                            | ✅     |
| Shortcut display (presentation only)                           | ✅     |
| Disabled action presentation                                   | ✅     |
| Group separators                                               | ✅     |
| Optional pinned actions                                        | ✅     |
| Empty-state improvements                                       | ✅     |
| Loading-state improvements                                     | ✅     |
| Ranking strategy extension point (documentation only)          | ✅     |
| Continues consuming read-only Action Registry                  | ✅     |
| Presentation-only (no registration/permissions/business logic) | ✅     |
| No shortcut handling or ranking logic in palette               | ✅     |
| No toolbar, context menus, AI, history, personalisation        | ✅     |
| All quality gates pass                                         | ✅     |

---

## Command Palette architecture summary

### AF-013 additions

```text
useCommandRegistry().list()
        │
        ▼
searchActionDescriptors()          ← unchanged (AF-012)
        │
        ▼
mapActionsToPaletteItems()         ← description, shortcut, disabled, pinned
        │
        ▼
CommandPalette (presentation)
  ├─ buildCommandPaletteRows()     ← pinned + group sections
  ├─ icons / descriptions / kbd
  ├─ disabled row styling + skip select
  └─ enhanced empty / loading panels
```

| Layer                               | AF-013 responsibility                          |
| ----------------------------------- | ---------------------------------------------- |
| `CommandPaletteItem` (`@apzhub/ui`) | Extended presentation fields                   |
| `buildCommandPaletteRows`           | Section layout for pinned + groups             |
| `CommandPalette`                    | Rich row rendering, keyboard skips disabled    |
| `mapActionsToPaletteItems`          | Descriptor → palette row mapping               |
| `WorkbenchCommandPalette`           | Optional `pinnedActionIds`, empty/loading copy |
| `ActionDescriptor`                  | Optional `description`, `disabled` metadata    |
| `RANKING-STRATEGY.md`               | Future injectable ranking — **docs only**      |

### Presentation-only rules preserved

The palette **does not**:

- Evaluate permissions (disabled flag is hydrated metadata only)
- Register actions
- Execute business logic beyond existing `onSelect` callback
- Handle shortcut chords
- Implement ranking logic

---

## Files added / modified

| Package           | File                                         | Change                                      |
| ----------------- | -------------------------------------------- | ------------------------------------------- |
| ui                | `command-palette/types.ts`                   | Extended item + empty/loading state types   |
| ui                | `command-palette/build-palette-rows.ts`      | **New** — pinned/group row layout           |
| ui                | `command-palette/build-palette-rows.test.ts` | **New**                                     |
| ui                | `command-palette/command-palette.tsx`        | Rich presentation rendering                 |
| ui                | `command-palette/command-palette.test.tsx`   | AF-013 presentation tests                   |
| ui                | `index.ts`                                   | Export new types                            |
| workspace         | `map-palette-items.ts`                       | Map description, shortcut, disabled, pinned |
| workspace         | `map-palette-items.test.ts`                  | **New**                                     |
| workspace         | `workbench-command-palette.tsx`              | `pinnedActionIds`, empty/loading props      |
| workspace         | `workbench-command-palette.test.tsx`         | Pinned + enhanced empty tests               |
| workspace         | `RANKING-STRATEGY.md`                        | **New** — ranking extension documentation   |
| workspace         | `index.ts`                                   | Export mapper types                         |
| command-framework | `types/action-descriptor.ts`                 | `description`, `disabled`                   |
| command-framework | `registry/freeze-action-descriptor.ts`       | Freeze new fields                           |
| command-framework | `extraction/map-action-manifest.ts`          | Map manifest fields                         |
| platform-runtime  | `schemas/workbench.ts`                       | Manifest `description`, `disabled`          |
| docs              | `specs/SPR-004-AF-palette.md`                | AF-013 presentation spec                    |
| docs              | `sprint/AF-013-completion-report.md`         | This report                                 |

---

## Test results

| Suite                                | Tests                   |
| ------------------------------------ | ----------------------- |
| `command-palette.test.tsx`           | 17 (+9 vs AF-012)       |
| `build-palette-rows.test.ts`         | 3 (new)                 |
| `map-palette-items.test.ts`          | 2 (new)                 |
| `workbench-command-palette.test.tsx` | 7 (+1)                  |
| **Monorepo total**                   | **576** (+15 vs AF-012) |

### Scenarios covered

- Icons from glyph or label initial
- Descriptions below label
- Shortcut `<kbd>` badges (display only)
- Disabled rows: `aria-disabled`, click/Enter skip
- Group section headers with separators
- Pinned section via `pinned: true` / `pinnedActionIds`
- Enhanced empty state (title + description)
- Enhanced loading state (message + description + indicator)
- Legacy `emptyMessage` / `loadingMessage` backward compatibility
- Mapper field pass-through
- Existing keyboard navigation and execution flows

---

## Coverage

| Area                                          | Status     |
| --------------------------------------------- | ---------- |
| `ui/.../command-palette/`                     | ✅ Covered |
| `ui/.../build-palette-rows.ts`                | ✅ Covered |
| `workspace/.../map-palette-items.ts`          | ✅ 100%    |
| `workspace/.../workbench-command-palette.tsx` | ✅ 100%    |
| All package thresholds                        | ✅ Pass    |
| Monorepo statements                           | ✅ 90.86%  |

---

## Quality gates

| Gate                 | Result                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`          | ✅ Pass                                                                                                         |
| `pnpm typecheck`     | ✅ Pass                                                                                                         |
| `pnpm build`         | ✅ Pass                                                                                                         |
| `pnpm test`          | ✅ 576 passed                                                                                                   |
| `pnpm test:coverage` | ✅ Pass                                                                                                         |
| `pnpm format:check`  | ⚠️ Pre-existing failure in `testing/fixtures/discovery/broken-yaml/component.yaml` (intentional broken fixture) |

---

## Technical debt

| ID         | Item                                                                                 | Target                      |
| ---------- | ------------------------------------------------------------------------------------ | --------------------------- |
| TD-AF13-01 | `enableCommandPalette` not wired in `apps/web`                                       | AF-020                      |
| TD-AF13-02 | Ranking strategy interface not implemented — documented only                         | AF-014+                     |
| TD-AF13-03 | Playwright palette E2E deferred until app hydration                                  | AF-020 / later              |
| TD-AF13-04 | Platform catalogue entries lack descriptions/icons — optional metadata               | Future manifest pass        |
| TD-AF13-05 | `disabled` flag must be hydrated server-side — palette does not evaluate permissions | AF-020 / permission adapter |

---

## Recommendations for AF-014

1. **ShortcutRegistry** — implement global shortcut registration; keep palette open chord as shell concern (per AF-012 note).
2. **Ranking strategy extraction** — introduce injectable `CommandPaletteRankingStrategy` at workspace boundary per `RANKING-STRATEGY.md`; default to current `searchActionDescriptors`.
3. **App wiring (AF-020)** — mount `CommandRegistryProvider`, `enableCommandPalette`, optional `pinnedActionIds` from user prefs (future — not personalisation in AF-013).
4. **Do not move** ranking or permission logic into `@apzhub/ui` `CommandPalette`.
5. **E2E** — add Playwright palette scenarios once `apps/web` hydration lands.

---

## Ranking strategy extension (documentation)

See [`packages/workspace/src/command-palette/RANKING-STRATEGY.md`](../../packages/workspace/src/command-palette/RANKING-STRATEGY.md).

Summary: ranking remains in `@apzhub/command-framework` (`searchActionDescriptors`) until a future workspace-injected strategy replaces it. Pinned actions are applied **after** ranking via presentation mapping only.

---

AF-013 complete. **Do not begin AF-014** until this report is reviewed and approved.
