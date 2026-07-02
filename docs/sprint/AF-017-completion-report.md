# AF-017 — Completion Report

> **Story:** AF-017 — Toolbar Workbench Surface  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-018**

---

## Objective

Implement the Toolbar Workbench Surface — presenting toolbar-designated actions from the hydrated Action Registry DTO with execution through the existing Workbench API.

---

## Acceptance criteria

| Criterion                                           | Status |
| --------------------------------------------------- | ------ |
| Toolbar provider                                    | ✅     |
| Toolbar presentation component                      | ✅     |
| Toolbar region support                              | ✅     |
| Registry filtering for toolbar regions              | ✅     |
| Diagnostics                                         | ✅     |
| Dependency injection                                | ✅     |
| Uses existing Action Registry + Workbench API path  | ✅     |
| Workbench Surface Pattern documentation             | ✅     |
| No register/execute-direct/permissions/own registry | ✅     |
| No AI, voice, business capabilities, customisation  | ✅     |
| All quality gates pass                              | ✅     |

---

## Architecture summary

```text
ActionRegistryDto.toolbar
        ↓
ToolbarProvider (region)
        ↓
WorkbenchToolbar
        ├─ filterToolbarRegionItems(toolbar, region)
        ├─ mapToolbarItems(items, registry)
        └─ Toolbar (@apzhub/ui)
        ↓
useCommandRegistry().execute(actionId)
        ↓
ActionExecutor → WorkbenchCommandBridge → Workbench
```

---

## Files added / modified

| Package           | File                                               | Change                                  |
| ----------------- | -------------------------------------------------- | --------------------------------------- |
| command-framework | `toolbar/filter-toolbar-region.ts`                 | **New** — region filter + sort          |
| command-framework | `react/command-registry-context.tsx`               | Expose `toolbar` DTO                    |
| command-framework | `react/use-command-registry.ts`                    | Expose `toolbar`, `get()`               |
| ui                | `components/toolbar/`                              | **New** presentational toolbar          |
| workspace         | `toolbar/`                                         | Provider, surface, diagnostics, mapping |
| workspace         | `desktop-shell.tsx`                                | `enableToolbar` integration             |
| workspace         | `command-palette/workbench-surfaces.ts`            | `TOOLBAR_SURFACE` implemented           |
| docs              | `specs/SPR-004-AF-toolbar.md`                      | **New** specification                   |
| docs              | `architecture/APZHUB-Workbench-Surface-Pattern.md` | **New** pattern doc                     |

---

## Test results

| Suite                            | Tests                   |
| -------------------------------- | ----------------------- |
| `filter-toolbar-region.test.ts`  | 3 (new)                 |
| `toolbar.test.tsx`               | 4 (new)                 |
| `workbench-toolbar.test.tsx`     | 7 (new)                 |
| `desktop-shell-toolbar.test.tsx` | 1 (new)                 |
| Mapper/diagnostics tests         | 2 (new)                 |
| `use-command-registry.test.tsx`  | +2                      |
| **Monorepo total**               | **650** (+21 vs AF-016) |

### Scenarios covered

- Toolbar rendering with icon buttons and tooltips
- Region filtering (`workspace`, `header`, empty region)
- Disabled action presentation (no execute)
- Execution via `useCommandRegistry().execute`
- Diagnostics reporting
- DesktopShell toolbar wiring

---

## Coverage

| Area                                             | Status     |
| ------------------------------------------------ | ---------- |
| `command-framework/.../filter-toolbar-region.ts` | ✅ Covered |
| `ui/.../toolbar/`                                | ✅ ~95%    |
| `workspace/.../toolbar/`                         | ✅ ~98%    |
| Monorepo statements                              | **91.26%** |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 650 passed |
| `pnpm test:coverage` | ✅ Pass       |

---

## Technical debt

| ID         | Item                                                              | Target          |
| ---------- | ----------------------------------------------------------------- | --------------- |
| TD-AF17-01 | `enableToolbar` not wired in `apps/web`                           | AF-020          |
| TD-AF17-02 | Manifest toolbar extraction not wired — DTO regions empty in prod | AF-019 / AF-020 |
| TD-AF17-03 | Non-`workspace` regions render empty until hydrated               | AF-020          |
| TD-AF17-04 | Toolbar customisation / reorder deferred                          | Future UX story |
| TD-AF17-05 | axe accessibility audit deferred                                  | Future CI story |

---

## Recommendations for AF-018

1. **Automation / AI / voice gateway stubs** — export `AutomationCommandGateway`, `AiActionGateway`, `VoiceActionGateway` per ADR-0026; stub with `NOT_IMPLEMENTED`.
2. **Wire executor routing** — route `ai-agent` and `voice` actors to gateway stubs in `DefaultActionExecutor`.
3. **Keep surfaces unchanged** — Palette, Context Menu, Toolbar continue using `execute()` with actor `user`.
4. **Parallel-safe** — AF-018 can proceed independently of AF-020 app wiring.
5. **Document** gateway extension points in Capability Development Guide (consolidated in AF-021 if needed).

---

## Workbench Surface Pattern

See [APZHUB-Workbench-Surface-Pattern.md](../architecture/APZHUB-Workbench-Surface-Pattern.md) — common pattern for Activity Bar, Sidebar, View, Panel, Status Bar, Command Palette, Context Menu, and Toolbar.

---

AF-017 complete. **Do not begin AF-018** until this report is reviewed and approved.
