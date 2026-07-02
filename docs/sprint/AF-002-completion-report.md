# AF-002 — Completion Report

> **Story:** AF-002 — Command Framework package scaffold  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-003**

---

## Objective

Create the foundation of the Action Framework — package structure, public exports, core interfaces, type definitions, placeholder implementations, and dependency injection points. No functional behaviour beyond scaffolding.

---

## Acceptance criteria

| Criterion                                                              | Status |
| ---------------------------------------------------------------------- | ------ |
| `@apzhub/command-framework` package in monorepo                        | ✅     |
| Exports: `.`, `./server`, `./react`                                    | ✅     |
| Action terminology internally (ActionDescriptor, ActionRegistry, etc.) | ✅     |
| No React dependency in core package.json                               | ✅     |
| Placeholder ActionRegistry and ActionExecutor                          | ✅     |
| DI via `createActionFrameworkContext()`                                | ✅     |
| Zero Runtime changes                                                   | ✅     |
| Zero Workbench changes                                                 | ✅     |
| Existing test suite green + new package tests                          | ✅     |
| Quality gates pass                                                     | ✅     |

---

## Files added

```text
packages/command-framework/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── index.test.ts
    ├── status.ts
    ├── server.ts
    ├── server.test.ts
    ├── types/
    │   ├── action-descriptor.ts
    │   ├── action-context.ts
    │   ├── action-result.ts
    │   ├── action-audit.ts
    │   └── index.ts
    ├── registry/
    │   ├── action-registry.ts
    │   ├── placeholder-action-registry.ts
    │   └── index.ts
    ├── executor/
    │   ├── action-executor.ts
    │   ├── placeholder-action-executor.ts
    │   └── index.ts
    ├── di/
    │   ├── action-framework-context.ts
    │   └── index.ts
    └── react/
        ├── index.ts
        └── index.test.ts
```

### Monorepo config updated

| File                 | Change                                      |
| -------------------- | ------------------------------------------- |
| `tsconfig.base.json` | Path aliases for command-framework exports  |
| `vitest.config.ts`   | Aliases, coverage threshold, index excludes |

---

## Public API summary

### Main — `@apzhub/command-framework`

| Export                                                         | Kind            | Description                              |
| -------------------------------------------------------------- | --------------- | ---------------------------------------- |
| `COMMAND_FRAMEWORK_STATUS`                                     | `"scaffold"`    | Package status constant                  |
| `ActionDescriptor`                                             | type            | Declarative action metadata              |
| `PlatformCommand`                                              | type alias      | ADR alignment alias for ActionDescriptor |
| `ActionContext`, `ActionActor`, `ActionExecutionRequest`       | types           | Execution context                        |
| `ActionResult`, `ActionResultCode`                             | types           | Execution outcome                        |
| `ActionAuditHook`, `noOpActionAuditHook`                       | type + value    | Audit extension point                    |
| `ActionRegistry`                                               | interface       | Registry contract                        |
| `PlaceholderActionRegistry`, `createPlaceholderActionRegistry` | class + factory | Scaffold registry                        |
| `ActionExecutor`                                               | interface       | Executor contract                        |
| `PlaceholderActionExecutor`, `createPlaceholderActionExecutor` | class + factory | Scaffold executor (returns `SCAFFOLD`)   |
| `createActionFrameworkContext`                                 | function        | DI composition root                      |
| `ActionFrameworkContext`, `ActionPermissionAdapter`            | types           | DI types                                 |

### Server — `@apzhub/command-framework/server`

| Export                                        | Description                       |
| --------------------------------------------- | --------------------------------- |
| `ActionRegistryDto`, `ActionToolbarRegionDto` | Serialisable DTOs                 |
| `filterActionRegistryDto()`                   | Pass-through placeholder (AF-005) |
| `COMMAND_FRAMEWORK_SERVER_STATUS`             | `"scaffold"`                      |

### React — `@apzhub/command-framework/react`

| Export                                    | Description                             |
| ----------------------------------------- | --------------------------------------- |
| `useActionRegistry()`                     | Placeholder hook — `{ isReady: false }` |
| `ACTION_FRAMEWORK_REACT_STATUS`           | `"placeholder"`                         |
| Re-exports `createActionFrameworkContext` | For provider wiring in AF-010           |

---

## Terminology mapping

| Internal (Action model) | Public / ADR reference        |
| ----------------------- | ----------------------------- |
| `ActionDescriptor`      | PlatformCommand (ADR-0025)    |
| `ActionRegistry`        | CommandRegistry (sprint docs) |
| `ActionExecutor`        | CommandExecutor (ADR-0026)    |
| `ActionContext`         | Command execution context     |
| `ActionResult`          | CommandExecutionResult        |

Package name remains `@apzhub/command-framework`. Sprint documentation may continue using "Command Framework".

---

## Test results

| Suite                                                | Tests   |
| ---------------------------------------------------- | ------- |
| `packages/command-framework/src/index.test.ts`       | 8       |
| `packages/command-framework/src/server.test.ts`      | 2       |
| `packages/command-framework/src/react/index.test.ts` | 3       |
| **Package total**                                    | **13**  |
| **Monorepo total**                                   | **396** |

---

## Quality gates

| Gate                 | Result                            |
| -------------------- | --------------------------------- |
| `pnpm lint`          | ✅ Pass                           |
| `pnpm typecheck`     | ✅ Pass (15 workspace packages)   |
| `pnpm build`         | ✅ Pass                           |
| `pnpm test`          | ✅ Pass — 396 tests               |
| `pnpm test:coverage` | ✅ Pass — command-framework ≥ 80% |
| `pnpm test:e2e`      | ✅ Pass — 15 tests                |

---

## Technical debt

| ID        | Item                                               | Target        |
| --------- | -------------------------------------------------- | ------------- |
| TD-AF2-01 | PlaceholderActionRegistry — no storage             | AF-003        |
| TD-AF2-02 | PlaceholderActionExecutor — returns SCAFFOLD only  | AF-006        |
| TD-AF2-03 | filterActionRegistryDto pass-through               | AF-005        |
| TD-AF2-04 | useActionRegistry placeholder                      | AF-010        |
| TD-AF2-05 | PlatformCommand alias — rename sync in docs AF-021 | AF-021        |
| TD-AF2-06 | No workbench-framework dependency yet              | AF-007 bridge |

---

## Recommendations for AF-003

1. **Replace `PlaceholderActionRegistry`** with `DefaultActionRegistry` — in-memory `Map`, duplicate id rejection, `list()` query filter (substring on label/id).

2. **Rename in implementation only** — keep exporting `ActionRegistry`; AF-021 may add `CommandRegistry` as deprecated alias if needed for ADR prose.

3. **File layout** — add `src/registry/default-action-registry.ts`; keep interface in `action-registry.ts`.

4. **Coverage target** — branch ≥ 85% on registry module per foundation spec.

5. **Do not wire** executor, server filter, or app integration — AF-003 scope is registry only.

6. **Status constant** — update to `"registry"` or keep `"scaffold"` until AF-006; recommend `"registry"` after AF-003 merge.

---

## Stop condition

AF-002 complete. **Do not begin AF-003** until this report is reviewed and approved.

---

_AF-002 Completion Report — Sprint 004 Action Framework._
