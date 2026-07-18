# AF-020 — Completion Report

> **Story:** AF-020 — Action Framework application integration  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-022**

---

## Objective

Integrate the completed Action Framework into the running APZHUB application (`apps/web`). Application wiring only — no new framework capabilities.

---

## Acceptance criteria

| Criterion                                                       | Status |
| --------------------------------------------------------------- | ------ |
| Load Action Registry DTO during authenticated shell startup     | ✅     |
| Wire `CommandRegistryProvider` into the application             | ✅     |
| Enable Command Palette, Global Shortcuts, Context Menu, Toolbar | ✅     |
| Inject `DefaultActionExecutor` into Workbench API               | ✅     |
| Production build includes `@apzhub/command-framework`           | ✅     |
| Hydration diagnostics (dev UI + health endpoint)                | ✅     |
| Integration tests                                               | ✅     |
| E2E tests                                                       | ✅     |
| All quality gates pass                                          | ✅     |
| No new execution paths / framework features                     | ✅     |

---

## Integration verification report

| Check                                                | Result                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Authenticated users receive hydrated Action Registry | ✅ `(platform)/layout` loads `loadActionRegistryDto()` in parallel with workbench registry |
| Platform Actions available after bootstrap           | ✅ Built-in catalogue + manifest actions in DTO                                            |
| Capability Actions appear when present               | ✅ Manifest extraction (`platform.theme.toggle`, `platform.home.navigate`)                 |
| Toolbar renders from Platform Assets                 | ✅ `DesktopShell enableToolbar` + workspace toolbar region                                 |
| Context Menu renders from Action Registry            | ✅ `enableContextMenu` + selection snapshot input                                          |
| Command Palette consumes read-only registry          | ✅ `CommandRegistryProvider` hydrates client registry from DTO                             |
| Global shortcuts execute through pipeline            | ✅ `enableGlobalShortcuts` → `useCommandRegistry().execute()`                              |
| Diagnostics report hydration / registry status       | ✅ Dev `ActionFrameworkDiagnostics` + `/api/health` `commands` field                       |

---

## End-to-end startup summary

```text
(platform)/layout [RSC]
  ├─ loadWorkbenchRegistryDto()
  └─ loadActionRegistryDto()
        └─ Runtime.bootstrap → bootstrapActionRegistry → filterActionRegistryDto

ActionWorkbenchShellProvider [client]
  WorkbenchProvider(resolveActionExecutor → createAppActionExecutorBundle)
    CommandRegistryProvider(dto, shared ActionExecutor)
      WorkbenchPage → DesktopShell(
        enableCommandPalette | enableGlobalShortcuts |
        enableContextMenu | enableToolbar
      )
      ActionFrameworkDiagnostics (dev only)
```

**Execution path:** Workbench surfaces → `useCommandRegistry().execute()` → shared `DefaultActionExecutor` → bridge → `bus.publish(actionToRequest(action))`.

---

## Engineering changes

| Area                          | Change                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `@apzhub/command-framework`   | `createWorkbenchActionExecutorFromActionExecutor`; executor registry type widened; export from package index |
| `@apzhub/workbench-framework` | `WorkbenchProvider.resolveActionExecutor` hook for DI without bus redesign                                   |
| `apps/web`                    | `ActionWorkbenchShellProvider`, `createAppActionExecutorBundle`, `command-hydration` health summary          |
| `apps/web`                    | `next.config.ts` transpilePackages: command-framework + workbench-framework                                  |
| `apps/web`                    | `/api/health` exposes `commands` hydration summary                                                           |
| `apps/web`                    | Removed unused `workbench-shell-provider.tsx`                                                                |
| `@apzhub/types`               | `ActionFrameworkHealthSummary` + `PlatformHealthResponse.commands`                                           |
| E2E                           | `spr-004-action-framework.spec.ts`; `spr-001` header theme selector fix                                      |

---

## Test results

| Suite                                             | Focus                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| `create-app-action-executor.test.ts`              | Shared executor + Workbench adapter wiring      |
| `action-framework-diagnostics.test.tsx`           | Dev diagnostics data attributes                 |
| `workbench-action-executor-from-executor.test.ts` | Executor → Workbench API adapter                |
| `workbench-context.test.tsx`                      | `resolveActionExecutor` request-bus integration |
| `spr-004-action-framework.spec.ts`                | Health, toolbar, palette, execution E2E         |
| `spr-002-runtime.spec.ts`                         | Health `commands` field                         |

**Monorepo total:** **672** (+4 vs AF-019)

---

## Coverage

Monorepo statement coverage: **91.46%**

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅            |
| `pnpm typecheck`     | ✅            |
| `pnpm build`         | ✅            |
| `pnpm test`          | ✅ 672 passed |
| `pnpm test:coverage` | ✅ 91.46%     |
| `pnpm test:e2e`      | ✅ 19 passed  |

---

## Technical debt

| ID         | Item                                                                                                  | Target                                          |
| ---------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| TD-AF20-01 | `platform.home.navigate` bridge uses manifest action id; bridge expects `workbench.navigation.reveal` | Future executor/bridge handler resolution story |
| TD-AF20-02 | `platform.theme.toggle` service handler returns `NOT_IMPLEMENTED`                                     | Theme service story (TD-AF19-01)                |
| TD-AF20-03 | Header theme toggle duplicates toolbar theme action (two controls)                                    | Future UX consolidation                         |
| TD-AF20-04 | `apps/web` lib modules depend on `next/headers` — not yet covered by Vitest integration suite         | Optional mocked hydration test                  |
| TD-AF20-05 | Production diagnostics UI hidden; health endpoint uses allow-all visibility                           | Document operational semantics in AF-021        |

---

## Recommendation for AF-021

AF-021 is documentation-only. Recommended scope:

1. **`docs/architecture/command-framework.md`** — document startup wiring, execution pipeline, and Platform vs Capability assets.
2. **Governance guide updates** — reference `ActionWorkbenchShellProvider` and health `commands` field.
3. **README / CHANGELOG v0.4.0** — user-facing integration summary.
4. **Resolve TD-AF20-01/02** in backlog notes without code changes in AF-021.

---

## Documentation

- [AF-019 completion report](./AF-019-completion-report.md)
- [SPR-004 Action Framework sprint doc](./SPR-004-action-framework.md)

**Next story:** AF-021 (documentation) — do not start until AF-020 is approved.
